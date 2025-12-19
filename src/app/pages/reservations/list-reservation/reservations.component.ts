import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MCTable, MCTdTemplateDirective } from '@mckit/table';
import { MCColumn } from '@mckit/core';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [CommonModule, MCTable, MCTdTemplateDirective],
  templateUrl: './reservations.component.html',
  styleUrls: ['./reservations.component.css']
})
export class ReservationsComponent implements OnInit {

  reservations: any[] = [];
  loading = true;
  columns: MCColumn[] = [
    { field: 'event_name', title: 'Event Name' },
    { field: 'start_time', title: 'Start Time' },
    { field: 'end_time', title: 'End Time' },
    { field: 'space_id', title: 'Space ID' },
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
    
    this.apiService.getAllReservationsByUser(userId).subscribe({
      next: (data) => {
        this.reservations = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
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
