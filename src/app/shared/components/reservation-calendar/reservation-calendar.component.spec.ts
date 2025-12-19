import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReservationCalendarComponent } from './reservation-calendar.component';

describe('ReservationCalendarComponent', () => {
  let component: ReservationCalendarComponent;
  let fixture: ComponentFixture<ReservationCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservationCalendarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservationCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should generate time slots', () => {
    component.startHour = 9;
    component.endHour = 17;
    component.generateTimeSlots();

    expect(component.timeSlots.length).toBe(9); // 9 AM to 5 PM
    expect(component.timeSlots[0]).toBe('09:00');
    expect(component.timeSlots[8]).toBe('17:00');
  });

  it('should generate week schedule with 7 days', () => {
    component.generateWeekSchedule();

    expect(component.weekSchedule.length).toBe(7);
  });

  it('should mark today correctly', () => {
    component.setCurrentWeek();
    component.generateWeekSchedule();

    const todaySchedule = component.weekSchedule.find(day => day.isToday);
    expect(todaySchedule).toBeDefined();
  });

  it('should find reservation for specific time slot', () => {
    component.reservations = [
      {
        date: '2024-12-20',
        start_time: '09:00',
        end_time: '11:00',
        event_name: 'Team Meeting'
      }
    ];

    const reservation = component.findReservation('2024-12-20', '09:00');
    expect(reservation).toBeDefined();
    expect(reservation.event_name).toBe('Team Meeting');
  });

  it('should navigate to previous week', () => {
    const initialDate = new Date(component.currentWeekStart);
    component.previousWeek();

    const expectedDate = new Date(initialDate);
    expectedDate.setDate(expectedDate.getDate() - 7);

    expect(component.currentWeekStart.getTime()).toBe(expectedDate.getTime());
  });

  it('should navigate to next week', () => {
    const initialDate = new Date(component.currentWeekStart);
    component.nextWeek();

    const expectedDate = new Date(initialDate);
    expectedDate.setDate(expectedDate.getDate() + 7);

    expect(component.currentWeekStart.getTime()).toBe(expectedDate.getTime());
  });
});
