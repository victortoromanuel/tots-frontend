import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-manage-space',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-space.component.html',
  styleUrls: ['./manage-space.component.css']
})
export class ManageSpaceComponent implements OnInit {

  // Mode: 'create' or 'edit'
  mode: 'create' | 'edit' = 'create';
  spaceId: number | null = null;
  
  space = {
    name: '',
    description: '',
    type: '',
    capacity: null as number | null,
    price_per_hour: null as number | null
  };

  errors: any = {};
  loading = false;
  loadingSpace = true;

  spaceTypes = [
    { label: 'Meeting Room', value: 'meeting_room' },
    { label: 'Auditorium', value: 'auditorium' },
    { label: 'Open Space', value: 'open_space' },
    { label: 'Other', value: 'other' }
  ];

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit() {
    // Check if we're in edit mode (has :id param) or create mode
    this.route.params.subscribe(params => {
      if (params['id']) {
        // Edit mode
        this.mode = 'edit';
        this.spaceId = +params['id'];
        this.loadSpace(this.spaceId);
      } else {
        // Create mode
        this.mode = 'create';
        this.loadingSpace = false;
      }
    });
  }

  loadSpace(id: number) {
    this.loadingSpace = true;
    this.apiService.getSpaces().subscribe({
      next: (spaces) => {
        const foundSpace = spaces.find(s => s.id === id);
        if (foundSpace) {
          this.space = {
            name: foundSpace.name || '',
            description: foundSpace.description || '',
            type: foundSpace.type || '',
            capacity: foundSpace.capacity || null,
            price_per_hour: foundSpace.price_per_hour || null
          };
        } else {
          this.toastService.showError('Space not found', 'Error');
          this.router.navigate(['/spaces']);
        }
        this.loadingSpace = false;
      },
      error: () => {
        this.toastService.showError('Failed to load space', 'Error');
        this.loadingSpace = false;
        this.router.navigate(['/spaces']);
      }
    });
  }

  onSubmit() {
    // Reset errors
    this.errors = {};

    // Validate required fields
    if (!this.space.name) {
      this.errors.name = 'Name is required';
    }
    if (!this.space.type) {
      this.errors.type = 'Type is required';
    }
    if (!this.space.capacity || this.space.capacity < 1) {
      this.errors.capacity = 'Capacity must be at least 1';
    }

    // If there are errors, don't submit
    if (Object.keys(this.errors).length > 0) {
      this.toastService.showError('Please fix the form errors', 'Validation Error');
      return;
    }

    this.loading = true;

    // Prepare payload (remove null values for optional fields)
    const payload: any = {
      name: this.space.name,
      type: this.space.type,
      capacity: this.space.capacity
    };

    if (this.space.description) {
      payload.description = this.space.description;
    }

    if (this.space.price_per_hour !== null && this.space.price_per_hour > 0) {
      payload.price_per_hour = this.space.price_per_hour;
    }

    if (this.mode === 'create') {
      this.createSpace(payload);
    } else {
      this.updateSpace(payload);
    }
  }

  createSpace(payload: any) {
    this.apiService.createSpace(payload).subscribe({
      next: () => {
        this.toastService.showSuccess(`Space "${this.space.name}" has been created successfully`);
        this.router.navigate(['/spaces']);
      },
      error: (error) => {
        this.loading = false;
        if (error.error?.errors) {
          this.errors = error.error.errors;
        }
        this.toastService.showError(
          error.error?.message || 'Failed to create space. Please try again.',
          'Creation Failed'
        );
      }
    });
  }

  updateSpace(payload: any) {
    if (!this.spaceId) return;

    this.apiService.updateSpace(this.spaceId, payload).subscribe({
      next: () => {
        this.toastService.showSuccess(`Space "${this.space.name}" has been updated successfully`);
        this.router.navigate(['/spaces']);
      },
      error: (error) => {
        this.loading = false;
        if (error.error?.errors) {
          this.errors = error.error.errors;
        }
        this.toastService.showError(
          error.error?.message || 'Failed to update space. Please try again.',
          'Update Failed'
        );
      }
    });
  }

  cancel() {
    this.router.navigate(['/spaces']);
  }

  get pageTitle(): string {
    return this.mode === 'create' ? 'Create New Space' : 'Edit Space';
  }

  get pageSubtitle(): string {
    return this.mode === 'create' ? 'Add a new space to your inventory' : 'Update space information';
  }

  get pageIcon(): string {
    return this.mode === 'create' ? 'pi-plus-circle' : 'pi-pencil';
  }

  get submitButtonText(): string {
    return this.mode === 'create' ? 'Create Space' : 'Update Space';
  }

  get loadingText(): string {
    return this.mode === 'create' ? 'Loading...' : 'Loading space data...';
  }

  get submitButtonLoadingText(): string {
    return this.mode === 'create' ? 'Creating...' : 'Updating...';
  }
}
