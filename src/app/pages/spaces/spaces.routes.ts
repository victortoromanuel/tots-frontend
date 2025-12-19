import { Routes } from '@angular/router';
import { SpacesComponent } from './list-spaces/spaces.component';
import { ManageSpaceComponent } from './manage-space/manage-space.component';
import { adminGuard } from '../../core/guards/admin.guard';

export const SPACES_ROUTES: Routes = [
  {
    path: '',
    component: SpacesComponent
  },
  {
    path: 'create',
    component: ManageSpaceComponent,
    canActivate: [adminGuard]
  },
  {
    path: 'edit/:id',
    component: ManageSpaceComponent,
    canActivate: [adminGuard]
  }
];