
export interface StudentRecord {
  id: string;
  name: string;
  arrivalTime: string; // HH:mm:ss
  departureTime: string;
  date: string; // YYYY-MM-DD
  delayMinutes: number;
  notified?: boolean; // Track if this delay has been included in a parent notice
}

export interface DailySummary {
  date: string;
  totalStudents: number;
  totalDelayed: number;
  avgDelay: number;
  maxDelay: number;
}

export interface Stats {
  topDelayedStudents: { name: string; count: number; totalMinutes: number }[];
  maxDelayOverall: number;
  busiestDay: string;
}

export enum ViewMode {
  Dashboard = 'DASHBOARD',
  Upload = 'UPLOAD',
  History = 'HISTORY',
  PrintReport = 'PRINT_REPORT',
  MonthlyReport = 'MONTHLY_REPORT',
  StudentReport = 'STUDENT_REPORT',
  ParentNotifications = 'PARENT_NOTIFICATIONS'
}
