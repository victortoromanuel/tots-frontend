import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { authGuard } from './core/guards/auth.guard';
import { RegisterComponent } from './auth/register/register.component';

export const routes: Routes = [
    { 
        path: 'register', component: RegisterComponent },
    { 
        path: 'login', component: LoginComponent },
    {
        path: 'spaces',
        canActivate: [authGuard],
        loadChildren: () =>
        import('./pages/spaces/spaces.routes')
            .then(m => m.SPACES_ROUTES)
    },
    {
        path: 'reservations',
        canActivate: [authGuard],
        loadChildren: () =>
            import('./pages/reservations/reservations.routes')
            .then(m => m.RESERVATIONS_ROUTES)
    },
    { path: '**', redirectTo: 'login' }
];
