import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface TimeSlot {
  time: string;
  reserved: boolean;
  eventName?: string;
}

interface DaySchedule {
  date: Date;
  dateString: string;
  dayName: string;
  isToday: boolean;
  slots: TimeSlot[];
}

@Component({
  selector: 'app-reservation-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservation-calendar.component.html',
  styleUrls: ['./reservation-calendar.component.css']
})
export class ReservationCalendarComponent implements OnInit, OnChanges {
  @Input() spaceId?: number;
  @Input() reservations: any[] = [];
  @Input() startHour: number = 7; // 7 AM
  @Input() endHour: number = 22; // 10 PM

  currentWeekStart: Date = new Date();
  weekSchedule: DaySchedule[] = [];
  timeSlots: string[] = [];
  selectedDate: Date = new Date();

  ngOnInit() {
    console.log('Calendar initialized with reservations:', this.reservations);
    this.generateTimeSlots();
    this.setCurrentWeek();
    this.generateWeekSchedule();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['reservations'] && !changes['reservations'].firstChange) {
      console.log('Calendar received new reservations:', this.reservations);
      this.generateWeekSchedule();
    }
  }

  generateTimeSlots() {
    this.timeSlots = [];
    for (let hour = this.startHour; hour <= this.endHour; hour++) {
      this.timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
  }

  setCurrentWeek() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust when Sunday
    this.currentWeekStart = new Date(today.setDate(diff));
    this.currentWeekStart.setHours(0, 0, 0, 0);
  }

  generateWeekSchedule() {
    this.weekSchedule = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const date = new Date(this.currentWeekStart);
      date.setDate(this.currentWeekStart.getDate() + i);
      
      const dateString = this.formatDate(date);
      const dayName = this.getDayName(date);
      const isToday = date.getTime() === today.getTime();

      const slots = this.generateDaySlots(dateString);

      this.weekSchedule.push({
        date,
        dateString,
        dayName,
        isToday,
        slots
      });
    }
  }

  generateDaySlots(dateString: string): TimeSlot[] {
    const slots: TimeSlot[] = [];
    
    console.log(`Generating slots for date: ${dateString}, reservations count:`, this.reservations.length);

    for (const time of this.timeSlots) {
      const reservation = this.findReservation(dateString, time);
      
      slots.push({
        time,
        reserved: !!reservation,
        eventName: reservation?.event_name
      });
    }

    return slots;
  }

  findReservation(date: string, time: string): any {
    const found = this.reservations.find(res => {
      // Handle different date formats
      let reservationDate = '';
      
      if (res.date) {
        // If there's a separate date field
        reservationDate = res.date?.split('T')[0] || res.date;
      } else if (res.start_time) {
        // If start_time is a full timestamp, extract the date
        reservationDate = res.start_time.split('T')[0];
      }
      
      if (reservationDate !== date) return false;

      // Extract time in HH:mm format from different possible formats
      let startTime = '00:00';
      let endTime = '23:59';
      
      if (res.start_time) {
        // Handle full timestamp (2024-01-15T10:00:00) or just time (10:00:00)
        const startParts = res.start_time.includes('T') 
          ? res.start_time.split('T')[1] 
          : res.start_time;
        startTime = startParts.substring(0, 5);
      }
      
      if (res.end_time) {
        // Handle full timestamp (2024-01-15T12:00:00) or just time (12:00:00)
        const endParts = res.end_time.includes('T') 
          ? res.end_time.split('T')[1] 
          : res.end_time;
        endTime = endParts.substring(0, 5);
      }

      const matches = time >= startTime && time < endTime;
      
      // Debug logging
      if (matches) {
        console.log('Match found!', {
          date,
          time,
          startTime,
          endTime,
          reservation: res
        });
      }
      
      return matches;
    });
    
    return found;
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getDayName(date: Date): string {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  }

  getMonthName(date: Date): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[date.getMonth()];
  }

  previousWeek() {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() - 7);
    this.generateWeekSchedule();
  }

  nextWeek() {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() + 7);
    this.generateWeekSchedule();
  }

  goToToday() {
    this.setCurrentWeek();
    this.generateWeekSchedule();
  }

  getWeekRange(): string {
    const start = this.weekSchedule[0]?.date;
    const end = this.weekSchedule[6]?.date;
    
    if (!start || !end) return '';

    const startMonth = this.getMonthName(start);
    const endMonth = this.getMonthName(end);
    const startDay = start.getDate();
    const endDay = end.getDate();
    const year = end.getFullYear();

    if (startMonth === endMonth) {
      return `${startMonth} ${startDay} - ${endDay}, ${year}`;
    } else {
      return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
    }
  }

  getSlotTooltip(slot: TimeSlot): string {
    if (slot.reserved && slot.eventName) {
      return `Reserved: ${slot.eventName}`;
    }
    return slot.reserved ? 'Reserved' : 'Available';
  }
}
