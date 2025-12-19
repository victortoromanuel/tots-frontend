import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { SpacesComponent } from './spaces.component';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

describe('SpacesComponent', () => {
  let component: SpacesComponent;
  let fixture: ComponentFixture<SpacesComponent>;
  let apiService: jasmine.SpyObj<ApiService>;
  let authService: jasmine.SpyObj<AuthService>;
  let toastService: jasmine.SpyObj<ToastService>;
  let router: jasmine.SpyObj<Router>;

  const mockSpaces = [
    {
      id: 1,
      name: 'Conference Room A',
      type: 'meeting_room',
      capacity: 10,
      price_per_hour: 50,
      description: 'Main conference room'
    },
    {
      id: 2,
      name: 'Auditorium',
      type: 'auditorium',
      capacity: 100,
      price_per_hour: 200,
      description: 'Large auditorium'
    },
    {
      id: 3,
      name: 'Open Space',
      type: 'open_space',
      capacity: 20,
      price_per_hour: null,
      description: 'Collaborative area'
    }
  ];

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['getSpaces', 'deleteSpace']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isAdmin']);
    const toastServiceSpy = jasmine.createSpyObj('ToastService', ['showSuccess', 'showError']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const activatedRouteSpy = {
      snapshot: { params: {}, queryParams: {} },
      params: of({}),
      queryParams: of({})
    };

    // Set default return values
    apiServiceSpy.getSpaces.and.returnValue(of([]));
    authServiceSpy.isAdmin.and.returnValue(false);

    await TestBed.configureTestingModule({
      imports: [SpacesComponent],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy }
      ]
    }).compileComponents();

    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture = TestBed.createComponent(SpacesComponent);
    component = fixture.componentInstance;
    // Don't call detectChanges here - let each test control when to trigger ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize component and load spaces', () => {
      // Reset and configure spies for this test
      apiService.getSpaces.and.returnValue(of(mockSpaces));
      authService.isAdmin.and.returnValue(true);

      fixture.detectChanges(); // Triggers ngOnInit

      expect(authService.isAdmin).toHaveBeenCalled();
      expect(component.isAdmin).toBe(true);
      expect(apiService.getSpaces).toHaveBeenCalled();
      expect(component.spaces).toEqual(mockSpaces);
      expect(component.loading).toBe(false);
    });

    it('should set isAdmin to false for non-admin users', () => {
      authService.isAdmin.and.returnValue(false);
      apiService.getSpaces.and.returnValue(of(mockSpaces));

      fixture.detectChanges();

      expect(component.isAdmin).toBe(false);
    });

    it('should generate all time options on init', () => {
      authService.isAdmin.and.returnValue(false);
      apiService.getSpaces.and.returnValue(of([]));

      fixture.detectChanges();

      expect(component.allTimeOptions.length).toBe(24);
      expect(component.allTimeOptions[0]).toBe('00:00');
      expect(component.allTimeOptions[23]).toBe('23:00');
    });
  });

  describe('loadSpaces', () => {
    beforeEach(() => {
      authService.isAdmin.and.returnValue(false);
    });

    it('should load spaces successfully', () => {
      apiService.getSpaces.and.returnValue(of(mockSpaces));

      component.loadSpaces();

      expect(component.loading).toBe(false);
      expect(component.spaces).toEqual(mockSpaces);
      expect(component.filteredSpaces.length).toBe(3);
    });

    it('should load spaces with date and time filters', () => {
      apiService.getSpaces.and.returnValue(of(mockSpaces));

      component.loadSpaces('2024-12-20', '09:00', '17:00');

      expect(apiService.getSpaces).toHaveBeenCalledWith('2024-12-20', '09:00', '17:00');
    });

    it('should handle error when loading spaces', () => {
      apiService.getSpaces.and.returnValue(throwError(() => new Error('Network error')));

      component.loadSpaces();

      expect(component.loading).toBe(false);
    });

    it('should extract unique types after loading', () => {
      apiService.getSpaces.and.returnValue(of(mockSpaces));

      component.loadSpaces();

      expect(component.uniqueTypes).toContain('meeting_room');
      expect(component.uniqueTypes).toContain('auditorium');
      expect(component.uniqueTypes).toContain('open_space');
      expect(component.uniqueTypes.length).toBe(3);
    });
  });

  describe('applyFilters', () => {
    beforeEach(() => {
      authService.isAdmin.and.returnValue(false);
      apiService.getSpaces.and.returnValue(of(mockSpaces));
      component.ngOnInit();
    });

    it('should apply local filters when date/time not specified', () => {
      component.filters.type = 'meeting_room';

      component.applyFilters();

      expect(component.filteredSpaces.length).toBe(1);
      expect(component.filteredSpaces[0].type).toBe('meeting_room');
    });

    it('should reload spaces with date/time filters', () => {
      apiService.getSpaces.and.returnValue(of(mockSpaces));
      component.filters.date = '2024-12-20';
      component.filters.startTime = '09:00';
      component.filters.endTime = '17:00';

      component.applyFilters();

      expect(apiService.getSpaces).toHaveBeenCalledWith('2024-12-20', '09:00', '17:00');
    });
  });

  describe('applyLocalFilters', () => {
    beforeEach(() => {
      authService.isAdmin.and.returnValue(false);
      apiService.getSpaces.and.returnValue(of(mockSpaces));
      component.ngOnInit();
    });

    it('should filter by type', () => {
      component.filters.type = 'auditorium';

      component.applyLocalFilters();

      expect(component.filteredSpaces.length).toBe(1);
      expect(component.filteredSpaces[0].name).toBe('Auditorium');
    });

    it('should filter by minimum capacity', () => {
      component.filters.minCapacity = 50;

      component.applyLocalFilters();

      expect(component.filteredSpaces.length).toBe(1);
      expect(component.filteredSpaces[0].capacity).toBe(100);
    });

    it('should filter by maximum capacity', () => {
      component.filters.maxCapacity = 20;

      component.applyLocalFilters();

      expect(component.filteredSpaces.length).toBe(2);
      expect(component.filteredSpaces.every(s => s.capacity <= 20)).toBe(true);
    });

    it('should filter by multiple criteria', () => {
      component.filters.minCapacity = 10;
      component.filters.maxCapacity = 50;

      component.applyLocalFilters();

      expect(component.filteredSpaces.length).toBe(2);
      expect(component.filteredSpaces[0].capacity).toBe(10);
      expect(component.filteredSpaces[1].capacity).toBe(20);
    });

    it('should return all spaces when no filters applied', () => {
      component.applyLocalFilters();

      expect(component.filteredSpaces.length).toBe(3);
    });
  });

  describe('clearFilters', () => {
    beforeEach(() => {
      authService.isAdmin.and.returnValue(false);
      apiService.getSpaces.and.returnValue(of(mockSpaces));
    });

    it('should reset all filters and reload spaces', () => {
      component.filters = {
        type: 'meeting_room',
        minCapacity: 10,
        maxCapacity: 50,
        date: '2024-12-20',
        startTime: '09:00',
        endTime: '17:00'
      };

      component.clearFilters();

      expect(component.filters.type).toBe('');
      expect(component.filters.minCapacity).toBeNull();
      expect(component.filters.maxCapacity).toBeNull();
      expect(component.filters.date).toBe('');
      expect(component.filters.startTime).toBe('');
      expect(component.filters.endTime).toBe('');
      expect(apiService.getSpaces).toHaveBeenCalled();
    });
  });

  describe('createReservation', () => {
    beforeEach(() => {
      authService.isAdmin.and.returnValue(false);
      apiService.getSpaces.and.returnValue(of([]));
    });

    it('should navigate to create reservation with spaceId', () => {
      component.createReservation(1);

      expect(router.navigate).toHaveBeenCalledWith(
        ['/reservations/create'],
        { queryParams: { spaceId: 1 } }
      );
    });
  });

  describe('deleteSpace', () => {
    beforeEach(() => {
      authService.isAdmin.and.returnValue(true);
      apiService.getSpaces.and.returnValue(of(mockSpaces));
    });

    it('should delete space after confirmation', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      apiService.deleteSpace.and.returnValue(of({}));
      apiService.getSpaces.and.returnValue(of(mockSpaces.slice(1)));

      component.deleteSpace(1, 'Conference Room A');

      expect(window.confirm).toHaveBeenCalledWith(
        'Are you sure you want to delete the space "Conference Room A"? This action cannot be undone.'
      );
      expect(apiService.deleteSpace).toHaveBeenCalledWith(1);
      expect(toastService.showSuccess).toHaveBeenCalledWith(
        'Space "Conference Room A" has been deleted successfully'
      );
      expect(apiService.getSpaces).toHaveBeenCalled();
    });

    it('should not delete space if user cancels confirmation', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      component.deleteSpace(1, 'Conference Room A');

      expect(window.confirm).toHaveBeenCalled();
      expect(apiService.deleteSpace).not.toHaveBeenCalled();
      expect(toastService.showSuccess).not.toHaveBeenCalled();
    });

    it('should show error message when delete fails', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      const errorResponse = { error: { message: 'Delete failed' } };
      apiService.deleteSpace.and.returnValue(throwError(() => errorResponse));

      component.deleteSpace(1, 'Conference Room A');

      expect(apiService.deleteSpace).toHaveBeenCalledWith(1);
      expect(toastService.showError).toHaveBeenCalledWith(
        'Delete failed',
        'Delete Failed'
      );
    });

    it('should show default error message when no error message provided', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      apiService.deleteSpace.and.returnValue(throwError(() => ({ error: {} })));

      component.deleteSpace(1, 'Conference Room A');

      expect(toastService.showError).toHaveBeenCalledWith(
        'Failed to delete space. Please try again.',
        'Delete Failed'
      );
    });
  });

  describe('generateAllTimeOptions', () => {
    it('should generate 24 time options in correct format', () => {
      component.generateAllTimeOptions();

      expect(component.allTimeOptions.length).toBe(24);
      expect(component.allTimeOptions[0]).toBe('00:00');
      expect(component.allTimeOptions[9]).toBe('09:00');
      expect(component.allTimeOptions[23]).toBe('23:00');
    });
  });

  describe('extractUniqueTypes', () => {
    it('should extract and sort unique types', () => {
      component.spaces = [
        { type: 'meeting_room' },
        { type: 'auditorium' },
        { type: 'meeting_room' },
        { type: 'open_space' }
      ];

      component.extractUniqueTypes();

      expect(component.uniqueTypes.length).toBe(3);
      expect(component.uniqueTypes).toEqual(['auditorium', 'meeting_room', 'open_space']);
    });
  });
});
