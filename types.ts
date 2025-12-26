
export enum WorkMode {
  ON_SITE = 'Sede',
  SMART_WORKING = 'Smart Working'
}

export interface Client {
  id: string;
  name: string;
  type: 'PIVA' | 'SocietÃ ';
  vatNumber?: string;
  dailyRate: number;
  totalDaysContracted: number;
  color: string;
  totalContractValue?: number;
}

export interface CalendarEvent {
  id: string;
  date: string; // ISO string YYYY-MM-DD
  clientId: string;
  hours: number;
  mode: WorkMode;
  notes: string;
  isFullDay: boolean;
  startTime?: string; // HH:mm
  endTime?: string;   // HH:mm
}

export type ViewType = 'calendar' | 'weekly' | 'agenda' | 'clients' | 'stats';