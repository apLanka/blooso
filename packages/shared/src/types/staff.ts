/**
 * Staff role within a business (different from UserRole)
 */
export enum StaffRole {
  OWNER = 'owner',
  MANAGER = 'manager',
  SENIOR_STAFF = 'senior_staff',
  STAFF = 'staff',
  JUNIOR_STAFF = 'junior_staff',
}

/**
 * Staff member entity (matches Prisma model)
 */
export interface StaffMember {
  id: string;
  userId: string;
  businessId: string;
  role: StaffRole;
  commissionRate: number;
  bio: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Staff schedule (weekly availability per day)
 */
export interface StaffSchedule {
  id: string;
  staffId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Staff service assignment (which services a staff can perform)
 */
export interface StaffService {
  id: string;
  staffId: string;
  serviceId: string;
  customDuration: number | null;
  customPrice: number | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Staff with user info and relations (for API responses)
 */
export interface StaffWithDetails extends StaffMember {
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
  staffSchedules: StaffSchedule[];
  staffServices: { serviceId: string; service?: { name: string } }[];
}
