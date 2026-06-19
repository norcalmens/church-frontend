import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/** Allows COMMITTEE (read-only) or ADMIN/SUPERADMIN to land on the page.
 *  Use on routes for Dashboard, All Registrations, All Attendees, 2027
 *  Interest List, Feedback, All Donations, Payment Plans -- committee
 *  members see them but edit/delete actions stay hidden via canEdit(). */
export const committeeOrAdminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.canViewAdmin()) return true;
  router.navigate(['/']);
  return false;
};
