export type AttendanceType = 'full' | 'partial';
export type RetreatDay = 'thu' | 'fri' | 'sat';
export type LinenOption = 'none' | 'package' | 'individual';
export type MealOption = 'none' | 'half' | 'full';

export interface Attendee {
  id?: number;
  firstName: string;
  lastName: string;
  age: number;
  dietaryRestrictions?: string;

  attendanceType?: AttendanceType;
  days?: RetreatDay[];

  linenOption?: LinenOption;
  linenItemCount?: number;

  mealOption?: MealOption;

  amountPaid?: number;

  speaker?: boolean;

  /** Optional per-attendee emergency contact. When blank the primary
   *  registration's emergency contact is used as a fallback. */
  emergencyName?: string;
  emergencyRelationship?: string;
  emergencyPhone?: string;

  // Hoisted from parent registration (populated by the admin flat-attendees endpoint)
  registrationId?: number;
  congregation?: string;
  primaryEmail?: string;
  primaryPhone?: string;
  /** Season this attendee belongs to (from parent registration). Powers
   *  the year filter + column on the admin attendees page. */
  retreatYear?: number;
}
