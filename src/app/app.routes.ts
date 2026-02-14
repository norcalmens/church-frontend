import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { adminGuard } from './core/auth/admin.guard';
import { LayoutComponent } from './layout/layout.component';
import { LoginComponent } from './features/login/login.component';
import { RegisterComponent } from './features/register/register.component';
import { HomeComponent } from './features/home/home.component';
import { RetreatRegistrationComponent } from './features/retreat-registration/retreat-registration.component';
import { VenueShowcaseComponent } from './features/venue-showcase/venue-showcase.component';
import { ThemePollComponent } from './features/theme-poll/theme-poll.component';
import { PaymentComponent } from './features/payment/payment.component';
import { AdminDashboardComponent } from './features/admin/dashboard/admin-dashboard.component';
import { ManageRegistrationsComponent } from './features/admin/registrations/manage-registrations.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: HomeComponent },
      { path: 'registration', component: RetreatRegistrationComponent },
      { path: 'venue', component: VenueShowcaseComponent },
      { path: 'theme-poll', component: ThemePollComponent },
      { path: 'payment', component: PaymentComponent },
      { path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [adminGuard] },
      { path: 'admin/registrations', component: ManageRegistrationsComponent, canActivate: [adminGuard] }
    ]
  },
  { path: '**', redirectTo: '' }
];
