import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { ReservationCalendarComponent } from '../../../shared/components/reservation-calendar/reservation-calendar.component';

@Component({
  selector: 'app-manage-reservation',
  standalone: true,
  imports: [CommonModule, FormsModule, ReservationCalendarComponent],
  templateUrl: './manage-reservation.component.html',
  styleUrls: ['./manage-reservation.component.css']
})
export class ManageReservationComponent implements OnInit {
  // Mode: 'create' or 'edit'
  mode: 'create' | 'edit' = 'create';
  
  // For create mode
  spaceId: number | null = null;
  space: any = null;
  
  // For edit mode
  reservationId: number | null = null;
  
  loading = true;
  error: string | null = null;
  reservations: any[] = [];
  allReservationsForSpace: any[] = []; // All reservations for calendar display
  loadingReservations = false;
  showCalendar = false; // Calendar collapsed by default
  occupiedTimeRanges: { start: string; end: string; }[] = [];
  allTimeOptions: string[] = [];
  availableStartTimes: string[] = [];
  availableEndTimes: string[] = [];
  
  reservation = {
    spaceId: 0,
    date: '',
    startTime: '',
    endTime: '',
    purpose: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.generateAllTimeOptions();
    
    // Check if we're in edit mode (has :id param) or create mode (has spaceId query param)
    this.route.params.subscribe(params => {
      if (params['id']) {
        // Edit mode
        this.mode = 'edit';
        this.reservationId = +params['id'];
        this.loadReservation(this.reservationId);
      }
    });
    
    this.route.queryParams.subscribe(params => {
      if (params['spaceId'] && !this.reservationId) {
        // Create mode
        this.mode = 'create';
        this.spaceId = +params['spaceId'];
        this.reservation.spaceId = this.spaceId;
        this.loadSpace(this.spaceId);
      } else if (!this.reservationId && !params['spaceId']) {
        this.loading = false;
      }
    });
  }

  generateAllTimeOptions() {
    for (let hour = 7; hour < 23; hour++) {
      const timeString = `${hour.toString().padStart(2, '0')}:00`;
      this.allTimeOptions.push(timeString);
    }
    this.availableStartTimes = [...this.allTimeOptions];
    this.availableEndTimes = [...this.allTimeOptions];
  }

  loadSpace(id: number) {
    this.apiService.getSpaces().subscribe({
      next: (spaces) => {
        this.space = spaces.find(s => s.id === id);
        this.loading = false;
        // Load all reservations for calendar display
        this.loadAllReservationsForSpace(id);
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadAllReservationsForSpace(spaceId: number) {
    this.loadingReservations = true;
    this.apiService.getAllReservationsBySpace(spaceId).subscribe({
      next: (reservations) => {
        console.log('Loaded all reservations for space:', spaceId, reservations);
        this.allReservationsForSpace = reservations;
        this.loadingReservations = false;
      },
      error: (err) => {
        console.error('Error loading reservations:', err);
        this.allReservationsForSpace = [];
        this.loadingReservations = false;
      }
    });
  }

  loadReservation(id: number) {
    this.apiService.getReservation(id).subscribe({
      next: (reservation) => {
        const startDate = new Date(reservation.start_time);
        const endDate = new Date(reservation.end_time);
        
        this.reservation = {
          spaceId: reservation.space_id,
          date: startDate.toISOString().split('T')[0],
          startTime: this.formatTime(startDate),
          endTime: this.formatTime(endDate),
          purpose: reservation.event_name
        };
        
        // Load space info for display
        this.loadSpace(reservation.space_id);
        
        // Load reservations for that date
        this.loadReservationsByDate();
      },
      error: () => {
        this.error = 'Error loading reservation';
        this.loading = false;
      }
    });
  }

  onDateChange() {
    if (this.reservation.date && this.reservation.spaceId) {
      this.loadReservationsByDate();
    }
  }

  loadReservationsByDate() {
    if (!this.reservation.spaceId || !this.reservation.date) return;

    this.apiService.getReservationsBySpace(this.reservation.spaceId, this.reservation.date).subscribe({
      next: (reservations) => {
        // Filter reservations for the selected date
        this.reservations = reservations.filter(r => {
          const reservationDate = new Date(r.start_time).toISOString().split('T')[0];
          const matchesDate = reservationDate === this.reservation.date;
          
          // In edit mode, exclude the current reservation
          if (this.mode === 'edit') {
            return matchesDate && r.id !== this.reservationId;
          }
          
          return matchesDate;
        });
        this.calculateOccupiedTimeRanges();
      },
      error: () => {
        this.reservations = [];
        this.occupiedTimeRanges = [];
        this.availableStartTimes = [...this.allTimeOptions];
        this.availableEndTimes = [...this.allTimeOptions];
      }
    });
  }

  calculateOccupiedTimeRanges() {
    if (this.reservations.length === 0) {
      this.occupiedTimeRanges = [];
      this.availableStartTimes = [...this.allTimeOptions];
      this.availableEndTimes = [...this.allTimeOptions];
      return;
    }

    // Get all start and end dates
    const allTimes = this.reservations.flatMap(r => [
      new Date(r.start_time),
      new Date(r.end_time)
    ]);

    // Find the earliest and latest times
    const minTime = new Date(Math.min(...allTimes.map(t => t.getTime())));
    const maxTime = new Date(Math.max(...allTimes.map(t => t.getTime())));

    // Create a single occupied range from min to max
    const minHour = minTime.getHours();
    const maxHour = maxTime.getHours();

    this.occupiedTimeRanges = [{
      start: this.formatTime(minTime),
      end: this.formatTime(maxTime)
    }];

    this.availableStartTimes = this.allTimeOptions;
    this.availableEndTimes = this.allTimeOptions;
  }

  formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  onSubmit() {
    const startDateTime = `${this.reservation.date}T${this.reservation.startTime}`;
    const endDateTime = `${this.reservation.date}T${this.reservation.endTime}`;
    
    const reservationData = {
      space_id: this.reservation.spaceId.toString(),
      event_name: this.reservation.purpose,
      start_time: startDateTime,
      end_time: endDateTime
    };

    if (this.mode === 'create') {
      this.createReservation(reservationData);
    } else {
      this.updateReservation(reservationData);
    }
  }

  createReservation(data: any) {
    this.apiService.createReservation(data).subscribe({
      next: () => {
        this.toastService.showSuccess('Reservation created successfully!');
        this.router.navigate(['/reservations']);
      },
      error: (err: any) => {
        if (err.status === 422) {
          const errorMessage = err.error.message || 'Invalid reservation';
          this.toastService.showError(errorMessage);
          this.error = errorMessage;
        } else {
          this.toastService.showError('Something went wrong. Please try again.');
          this.error = 'Something went wrong';
        }
      }
    });
  }

  updateReservation(data: any) {
    if (!this.reservationId) return;

    this.apiService.updateReservation(this.reservationId, data).subscribe({
      next: () => {
        this.toastService.showSuccess('Reservation updated successfully!');
        this.router.navigate(['/reservations']);
      },
      error: (err: any) => {
        if (err.status === 422) {
          const errorMessage = err.error.message || 'Invalid reservation';
          this.toastService.showError(errorMessage);
          this.error = errorMessage;
        } else {
          this.toastService.showError('Something went wrong. Please try again.');
          this.error = 'Something went wrong';
        }
      }
    });
  }

  cancel() {
    if (this.mode === 'create') {
      this.router.navigate(['/spaces']);
    } else {
      this.router.navigate(['/reservations']);
    }
  }

  toggleCalendar() {
    this.showCalendar = !this.showCalendar;
  }

  get pageTitle(): string {
    return this.mode === 'create' ? 'Create Reservation' : 'Edit Reservation';
  }

  get pageSubtitle(): string {
    return this.mode === 'create' ? 'Book your space for the perfect time' : 'Update your booking details';
  }

  get pageIcon(): string {
    return this.mode === 'create' ? 'pi-plus-circle' : 'pi-pencil';
  }

  get submitButtonText(): string {
    return this.mode === 'create' ? 'Create Reservation' : 'Update Reservation';
  }

  get loadingText(): string {
    return this.mode === 'create' ? 'Loading space details...' : 'Loading reservation details...';
  }
}
