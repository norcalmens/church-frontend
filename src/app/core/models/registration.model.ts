import { Attendee } from './attendee.model';

export interface Registration {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  congregation?: string;
  roomPreference: string;
  emergencyName: string;
  emergencyRelationship: string;
  emergencyPhone: string;
  specialRequests?: string;
  agreedToTerms: boolean;
  speaker?: boolean;
  stripePaymentId?: string;
  paymentStatus?: string;
  totalAmount?: number;
  userId?: number;
  registeredAt?: string;
  updatedAt?: string;
  /** Season this row belongs to (e.g. 2026, 2027). Admin can filter the
   *  list by year; the counter only sums the currently-active year. */
  retreatYear?: number;
  attendees: Attendee[];
  // Populated only on create response so the success screen can show
  // "You are #N of CAPACITY" without an extra round trip.
  positionFirst?: number;
  positionLast?: number;
  totalAttendees?: number;
  capacity?: number;
}
