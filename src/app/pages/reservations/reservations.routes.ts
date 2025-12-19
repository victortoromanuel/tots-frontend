import { Routes } from '@angular/router';
import { ReservationsComponent } from './list-reservation/reservations.component';
import { ManageReservationComponent } from './manage-reservation/manage-reservation.component';

export const RESERVATIONS_ROUTES: Routes = [
  {
    path: '',
    component: ReservationsComponent
  },
  {
    path: 'create',
    component: ManageReservationComponent
  },
  {
    path: 'edit/:id',
    component: ManageReservationComponent
  }
];
