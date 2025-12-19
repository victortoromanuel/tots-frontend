import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  email = '';
  password = '';
  loading = false;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  submit() {
    this.error = null;
    this.loading = true;

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.loading = false;
        console.log('Login successful');
        this.router.navigate(['/spaces']);
      },
      error: (err) => {
        this.loading = false;

        if (err.status === 401) {
          this.error = 'Invalid credentials';
        } else {
          this.error = 'Something went wrong. Please try again.';
        }
      }
    });
  }
}
