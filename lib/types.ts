export type ClientStatus = 'LEAD' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
export type ClientType = 'person' | 'organization';
export type TaskStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING' | 'COMPLETED' | 'CANCELLED';

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
  hourlyRate: string | null;
  responsiblePersonId: string | null;
  responsibleOrganizationId: string | null;
  lastContactAt: string | null;
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

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  revenue: string | null;
  clientId: string | null;
  projectId: string | null;
  assignedUserId: string | null;
  organizationId: string | null;
  dueDate: string | null;
  lastContactAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Task mit Client-Daten für Dashboard-Anzeige
export interface TaskWithClient extends Task {
  clientName: string | null;
  clientStatus: ClientStatus | null;
}

export interface RevenueOverview {
  month: string;
  revenue: number;
}

export interface DashboardData {
  // Klienten
  allClients: Client[];
  activeClients: Client[];
  waitingClients: Client[];  // LEAD status
  inactiveClients: Client[];
  recentClients: Client[];   // Letzte 5
  
  // Projekte
  runningProjects: Project[];
  
  // Aufgaben (mit Client-Info für Anzeige)
  openTasks: TaskWithClient[];
  currentTasks: TaskWithClient[];      // IN_PROGRESS
  
  // Umsatz
  monthlyRevenue: number;
  revenueOverview: RevenueOverview[];
  
  // Aktivitäten
  latestActions: Action[];
  
  // Counts für schnelle Übersicht
  counts: {
    totalClients: number;
    activeClients: number;
    waitingClients: number;
    inactiveClients: number;
    runningProjects: number;
    openTasks: number;
  };
}