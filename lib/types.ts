export type ClientStatus = 'LEAD' | 'ACTIVE' | 'ARCHIVED' | 'PENDING';
export type ClientType = 'person' | 'organization';

export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  status: ClientStatus;
  type: ClientType;
  responsiblePersonId: string | null;
  responsibleOrganizationId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  title: string;
  clientId: string;
  userId: string;
  organizationId: string | null;
  teamId: string | null;
  finished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Action {
  id: number;
  userId: string;
  actionType: string;
  description: string;
  timestamp: string;
}

export interface Deletion {
  projectId: string;
  clientId: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface DashboardData {
  clientNumber: number;
  runningProjects: number;
  organisations: number;
  organisationProjects: number;
  teamNumbers: number;
  latestActions: Action[];
}