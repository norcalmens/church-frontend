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
}
