import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MCTable, MCThTemplateDirective, MCTdTemplateDirective } from '@mckit/table';
import { MCColumn } from '@mckit/core';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-spaces',
  standalone: true,
  imports: [CommonModule, FormsModule, MCTable, MCTdTemplateDirective, RouterLink],
  templateUrl: './spaces.component.html',
  styleUrls: ['./spaces.component.css']
})
export class SpacesComponent implements OnInit {

  spaces: any[] = [];
  filteredSpaces: any[] = [];
  loading = true;
  isAdmin = false;
  columns: MCColumn[] = [
    { field: 'name', title: 'Name' },
    { field: 'type', title: 'Type' },
    { field: 'capacity', title: 'Capacity' },
    { field: 'actions', title: 'Actions' }
  ];

  filters = {
    type: '',
    minCapacity: null as number | null,
    maxCapacity: null as number | null,
    date: '',
    startTime: '',
    endTime: ''
  };

  uniqueTypes: string[] = [];
  allTimeOptions: string[] = [];

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit() {
    this.isAdmin = this.authService.isAdmin();
    this.generateAllTimeOptions();
    this.loadSpaces();
  }

  generateAllTimeOptions() {
    for (let hour = 0; hour < 24; hour++) {
      const timeString = `${hour.toString().padStart(2, '0')}:00`;
      this.allTimeOptions.push(timeString);
    }
  }

  loadSpaces(date?: string, startTime?: string, endTime?: string) {
    this.loading = true;
    this.apiService.getSpaces(date, startTime, endTime).subscribe({
      next: (data) => {
        this.spaces = data;
        this.applyLocalFilters();
        this.extractUniqueTypes();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  extractUniqueTypes() {
    const types = this.spaces.map(space => space.type);
    this.uniqueTypes = [...new Set(types)].sort();
  }

  applyFilters() {
    if (this.filters.date && this.filters.startTime && this.filters.endTime) {
      this.loadSpaces(this.filters.date, this.filters.startTime, this.filters.endTime);
    } else {
      this.applyLocalFilters();
    }
  }

  applyLocalFilters() {
    this.filteredSpaces = this.spaces.filter(space => {
      // Filter by type
      if (this.filters.type && space.type !== this.filters.type) {
        return false;
      }

      // Filter by minimum capacity
      if (this.filters.minCapacity !== null && space.capacity < this.filters.minCapacity) {
        return false;
      }

      // Filter by maximum capacity
      if (this.filters.maxCapacity !== null && space.capacity > this.filters.maxCapacity) {
        return false;
      }

      return true;
    });
  }

  clearFilters() {
    this.filters = {
      type: '',
      minCapacity: null,
      maxCapacity: null,
      date: '',
      startTime: '',
      endTime: ''
    };
    this.loadSpaces();
  }

  createReservation(spaceId: number) {
    this.router.navigate(['/reservations/create'], { queryParams: { spaceId } });
  }

  deleteSpace(spaceId: number, spaceName: string) {
    if (!confirm(`Are you sure you want to delete the space "${spaceName}"? This action cannot be undone.`)) {
      return;
    }

    this.apiService.deleteSpace(spaceId).subscribe({
      next: () => {
        this.toastService.showSuccess(`Space "${spaceName}" has been deleted successfully`);
        this.loadSpaces();
      },
      error: (error) => {
        this.toastService.showError(
          error.error?.message || 'Failed to delete space. Please try again.',
          'Delete Failed'
        );
      }
    });
  }
}
