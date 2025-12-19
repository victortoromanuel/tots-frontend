import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MCTable, MCTdTemplateDirective } from '@mckit/table';
import { MCColumn } from '@mckit/core';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [CommonModule, MCTable, MCTdTemplateDirective],
  templateUrl: './reservations.component.html',
  styleUrls: ['./reservations.component.css']
})
export class ReservationsComponent implements OnInit {

  reservations: any[] = [];
  spaces: any[] = [];
  loading = true;
  columns: MCColumn[] = [
    { field: 'event_name', title: 'Event Name' },
    { field: 'space_name', title: 'Space' },
    { field: 'date', title: 'Date' },
    { field: 'start_time', title: 'Start Time' },
    { field: 'end_time', title: 'End Time' },
    { field: 'actions', title: 'Actions' }
  ];

  constructor(
    private apiService: ApiService, 
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadReservations();
  }

  loadReservations() {
    const userId = this.authService.getUserId();
    if (!userId) {
      this.loading = false;
      return;
    }
    
    // Load both reservations and spaces
    forkJoin({
      reservations: this.apiService.getAllReservationsByUser(userId),
      spaces: this.apiService.getSpaces()
    }).subscribe({
      next: (data) => {
        this.spaces = data.spaces;
        this.reservations = this.processReservations(data.reservations);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading reservations:', error);
        this.toastService.showError('Failed to load reservations. Please try again.');
        this.loading = false;
      }
    });
  }

  processReservations(reservations: any[]): any[] {
    return reservations.map(reservation => {
      // Find the space name
      const space = this.spaces.find(s => s.id === reservation.space_id);
      
      // Extract date from start_time or date field
      let date = '';
      let startTime = '';
      let endTime = '';
      
      // Handle date extraction
      if (reservation.date) {
        // If there's a separate date field
        const dateObj = new Date(reservation.date);
        date = dateObj.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
      } else if (reservation.start_time) {
        // Extract date from start_time timestamp
        const startDate = new Date(reservation.start_time);
        date = startDate.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
      }
      
      // Format start time
      if (reservation.start_time) {
        startTime = this.formatTime(reservation.start_time);
      }
      
      // Format end time
      if (reservation.end_time) {
        endTime = this.formatTime(reservation.end_time);
      }
      
      return {
        ...reservation,
        space_name: space ? space.name : 'Unknown Space',
        date: date || 'N/A',
        start_time: startTime || 'N/A',
        end_time: endTime || 'N/A'
      };
    });
  }

  formatTime(timeString: string): string {
    // Handle both full timestamp and time-only formats
    let time = timeString;
    
    // If it's a full timestamp (contains 'T'), extract the time part
    if (timeString.includes('T')) {
      time = timeString.split('T')[1];
    }
    
    // Remove seconds (get only HH:mm)
    return time.substring(0, 5);
  }

  createNewReservation() {
    this.router.navigate(['/spaces']);
  }

  editReservation(reservationId: number) {
    this.router.navigate(['/reservations/edit', reservationId]);
  }

  deleteReservation(reservationId: number) {
    if (confirm('Are you sure you want to delete this reservation?')) {
      this.apiService.deleteReservation(reservationId).subscribe({
        next: () => {
          this.toastService.showSuccess('Reservation deleted successfully!');
          this.loadReservations();
        },
        error: (error) => {
          console.error('Error deleting reservation:', error);
          this.toastService.showError('Failed to delete reservation. Please try again.');
        }
      });
    }
  }
}
