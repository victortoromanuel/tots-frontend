import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  name = '';
  email = '';
  password = '';
  password_confirmation = '';

  loading = false;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  submit() {
    this.error = null;
    this.loading = true;

    this.authService.register({
      name: this.name,
      email: this.email,
      password: this.password,
      password_confirmation: this.password_confirmation
    }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/spaces']);
      },
      error: (err) => {
        this.loading = false;

        if (err.status === 422) {
          this.error = 'Validation error. Please check the fields.';
        } else {
          this.error = 'Something went wrong.';
        }
      }
    });
  }
}
