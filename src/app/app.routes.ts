import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { adminGuard } from './core/auth/admin.guard';
import { committeeOrAdminGuard } from './core/auth/committee-or-admin.guard';
import { LayoutComponent } from './layout/layout.component';
import { LoginComponent } from './features/login/login.component';
import { ForgotPasswordComponent } from './features/forgot-password/forgot-password.component';
import { CompleteRegistrationComponent } from './features/complete-registration/complete-registration.component';
import { ForcePasswordChangeComponent } from './features/force-password-change/force-password-change.component';
import { HomeComponent } from './features/home/home.component';
import { RetreatRegistrationComponent } from './features/retreat-registration/retreat-registration.component';
import { VenueShowcaseComponent } from './features/venue-showcase/venue-showcase.component';
import { ThemePollComponent } from './features/theme-poll/theme-poll.component';
import { AdminDashboardComponent } from './features/admin/dashboard/admin-dashboard.component';
import { ManageRegistrationsComponent } from './features/admin/registrations/manage-registrations.component';
import { UserManagementComponent } from './features/admin/user-management/user-management.component';
import { MerchandiseComponent } from './features/merchandise/merchandise.component';
import { DonationsComponent } from './features/donations/donations.component';
import { WorshipComponent } from './features/worship/worship.component';
import { ItineraryComponent } from './features/itinerary/itinerary.component';
import { DirectionsComponent } from './features/directions/directions.component';
import { FeedbackComponent } from './features/feedback/feedback.component';
import { QrCodesComponent } from './features/qr-codes/qr-codes.component';
import { ZoomLinksAdminComponent } from './features/admin/zoom-links/zoom-links-admin.component';
import { AllDonationsComponent } from './features/admin/donations/all-donations.component';
import { BadgesAdminComponent } from './features/admin/badges/badges-admin.component';
import { WaitlistComponent } from './features/waitlist/waitlist.component';
import { WaitlistAdminComponent } from './features/admin/waitlist/waitlist-admin.component';
import { AdminSettingsComponent } from './features/admin/settings/admin-settings.component';
import { AllAttendeesComponent } from './features/admin/attendees/all-attendees.component';
import { FeedbackAdminComponent } from './features/admin/feedback/feedback-admin.component';
import { PaymentPlansAdminComponent } from './features/admin/payment-plans/payment-plans-admin.component';
import { PaymentPlanPortalComponent } from './features/payment-plan/payment-plan-portal.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'register', component: CompleteRegistrationComponent },
  { path: 'change-password', component: ForcePasswordChangeComponent, canActivate: [authGuard] },
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'registration', component: RetreatRegistrationComponent },
      { path: 'venue', component: VenueShowcaseComponent },
      { path: 'directions', component: DirectionsComponent },
      { path: 'itinerary', component: ItineraryComponent },
      { path: 'feedback', component: FeedbackComponent },
      { path: 'qr-codes', component: QrCodesComponent },
      { path: 'waitlist', component: WaitlistComponent },
      { path: 'merchandise', component: MerchandiseComponent },
      { path: 'donations', component: DonationsComponent },
      { path: 'worship', component: WorshipComponent },
      { path: 'admin/zoom-links', component: ZoomLinksAdminComponent, canActivate: [authGuard, adminGuard] },
      { path: 'admin/donations', component: AllDonationsComponent, canActivate: [authGuard, committeeOrAdminGuard] },
      { path: 'admin/payment-plans', component: PaymentPlansAdminComponent, canActivate: [authGuard, committeeOrAdminGuard] },
      { path: 'plan/:token', component: PaymentPlanPortalComponent },
      { path: 'theme-poll', component: ThemePollComponent, canActivate: [authGuard, adminGuard] },
      { path: 'payment', redirectTo: 'registration', pathMatch: 'full' },
      { path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [authGuard, committeeOrAdminGuard] },
      { path: 'admin/registrations', component: ManageRegistrationsComponent, canActivate: [authGuard, committeeOrAdminGuard] },
      { path: 'admin/attendees', component: AllAttendeesComponent, canActivate: [authGuard, committeeOrAdminGuard] },
      { path: 'admin/badges', component: BadgesAdminComponent, canActivate: [authGuard, adminGuard] },
      { path: 'admin/waitlist', component: WaitlistAdminComponent, canActivate: [authGuard, committeeOrAdminGuard] },
      { path: 'admin/feedback', component: FeedbackAdminComponent, canActivate: [authGuard, committeeOrAdminGuard] },
      { path: 'admin/settings', component: AdminSettingsComponent, canActivate: [authGuard, adminGuard] },
      { path: 'admin/users', component: UserManagementComponent, canActivate: [authGuard, adminGuard] }
    ]
  },
  { path: '**', redirectTo: '' }
];
