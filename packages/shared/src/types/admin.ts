export interface AdminDashboardStats {
  totalUsers: number;
  totalBusinesses: number;
  totalAppointments: number;
  totalApplications: number;
  totalRevenue: number;
  recentApplications: any[];
}

export interface AdminUserDTO {
  id: string;
  email: string;
  name: string;
  role: 'client' | 'staff' | 'manager' | 'owner' | 'admin';
  createdAt: string | Date;
  businesses: { id: string }[];
}

export interface AdminBusinessDTO {
  id: string;
  name: string;
  slug: string;
  createdAt: string | Date;
  owner: {
    name: string;
    email: string;
  };
  _count: {
    appointments: number;
    staffMembers: number;
  };
}
