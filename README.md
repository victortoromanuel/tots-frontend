# 🏢 Tots Frontend - Space Reservation System

Modern web application for managing workspace reservations built with Angular 19.2.0 and PrimeNG.

## 📋 Overview

A comprehensive space management and reservation system featuring:
- 🔐 **JWT Authentication** - Secure login and registration
- 👥 **Role-Based Access Control** - Admin and User roles
- 🏠 **Space Management** - Create, edit, and delete workspaces (Admin only)
- 📅 **Reservation System** - Book spaces with time slot management
- ⏰ **Conflict Prevention** - Real-time occupied time range detection
- 💰 **Pricing Support** - Optional hourly rates for spaces

## 🚀 Tech Stack

- **Framework**: Angular 19.2.0 (Standalone Components)
- **UI Library**: PrimeNG 21.0.2
- **Data Tables**: @mckit/table
- **Authentication**: JWT with BehaviorSubject state management
- **HTTP Client**: Angular HttpClient with interceptors
- **Routing**: Functional guards (authGuard, adminGuard)

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Angular CLI 19.2.19

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/victortoromanuel/tots-frontend.git
cd tots-frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
Update the API URL in `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api'  // Your backend URL
};
```

4. **Start development server**
```bash
npm start
# or
ng serve
```

5. **Open in browser**
Navigate to `http://localhost:4200/`

## 🏗️ Project Structure

```
src/app/
├── auth/                    # Authentication module
│   ├── login/              # Login component
│   └── register/           # Register component
├── core/                    # Core functionality
│   ├── guards/             # Route guards (auth, admin)
│   ├── interceptors/       # JWT interceptor
│   └── services/           # API & Auth services
├── pages/
│   ├── spaces/
│   │   ├── list-spaces/    # Space listing (with admin actions)
│   │   └── manage-space/   # Create/Edit space (unified component)
│   └── reservations/
│       ├── list-reservation/    # User reservations
│       └── manage-reservation/  # Create/Edit reservation (unified)
└── environments/           # Environment configurations
```

## 🎯 Key Features

### Authentication & Security
- Secure JWT token storage (localStorage)
- User state managed via BehaviorSubject (prevents manipulation)
- Token expiration validation
- Protected routes with functional guards

### Space Management (Admin Only)
- Create new spaces with capacity and pricing
- Edit existing space details
- Delete spaces with confirmation
- Space types: Meeting Room, Auditorium, Open Space, Other

### Reservation System
- Browse available spaces
- View capacity and hourly rates
- Select date and time range
- Real-time conflict detection
- Edit or cancel existing reservations

## 🔑 User Roles

**Admin**
- Full access to space management (CRUD)
- Can create, edit, and delete spaces
- Access to all user features

**User**
- View available spaces
- Create personal reservations
- Edit/delete own reservations
- Cannot modify space inventory

## 🛠️ Available Scripts

```bash
# Development
npm start              # Start dev server on localhost:4200
ng serve --open        # Start and open browser

# Building
npm run build          # Production build
ng build --configuration production

# Testing
npm test               # Run unit tests
ng test

# Code Generation
ng generate component <name>
ng generate service <name>
```

## 🌐 API Integration

The app connects to a REST API with the following endpoints:

- `POST /auth/login` - User authentication
- `POST /auth/register` - User registration
- `GET /spaces` - List all spaces
- `POST /spaces` - Create space (admin)
- `PUT /spaces/:id` - Update space (admin)
- `DELETE /spaces/:id` - Delete space (admin)
- `GET /reservations` - List user reservations
- `GET /reservations/space/:id` - Get all reservations for a space
- `POST /reservations` - Create reservation
- `PUT /reservations/:id` - Update reservation
- `DELETE /reservations/:id` - Delete reservation

**Note**: Update `environment.apiUrl` to match your backend server.

## 🎨 Design System

- **Gradient Theme**: Purple gradient (#667eea → #764ba2)
- **Responsive Design**: Mobile-first approach
- **PrimeNG Components**: Consistent UI/UX
- **Toast Notifications**: User feedback for all actions

## 📝 Development Notes

- Uses **standalone components** (no NgModules)
- **DRY principle** applied: Unified components for create/edit operations
- Snake_case for API fields (e.g., `price_per_hour`, `meeting_room`)
- All dates handled in ISO format
- Time slots in 24-hour format

## 👨‍💻 Contributing

1. Follow Angular style guide
2. Use standalone components
3. Maintain consistent naming conventions
4. Add proper error handling
5. Update documentation as needed

## 📄 License

This project is part of the Tots development portfolio.

---

Built with ❤️ using Angular & PrimeNG
