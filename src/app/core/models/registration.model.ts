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
  roomPreference: string;
  emergencyName: string;
  emergencyRelationship: string;
  emergencyPhone: string;
  specialRequests?: string;
  agreedToTerms: boolean;
  stripePaymentId?: string;
  paymentStatus?: string;
  totalAmount?: number;
  userId?: number;
  registeredAt?: string;
  updatedAt?: string;
  attendees: Attendee[];
}
