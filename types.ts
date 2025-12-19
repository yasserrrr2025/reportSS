
export interface StudentRecord {
  id: string;
  name: string;
  arrivalTime: string; // HH:mm:ss
  departureTime: string;
  date: string; // YYYY-MM-DD
  delayMinutes: number;
  notified?: boolean; // Track if this delay has been included in a parent notice
}

export interface StudentMetadata {
  id: string;
  name: string;
  className: string;
  section: string;
}

// الهيكلية الجديدة: تجميع حسب معرف الطالب ثم التاريخ
export type GroupedData = Record<string, Record<string, StudentRecord>>;

export interface DailySummary {
  date: string;
  totalStudents: number;
  totalDelayed: number;
  avgDelay: number;
  maxDelay: number;
}

export interface Stats {
  topDelayedStudents: { id: string; name: string; count: number; totalMinutes: number }[];
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
  ParentNotifications = 'PARENT_NOTIFICATIONS',
  AllStudentsStats = 'ALL_STUDENTS_STATS',
  StudentDatabase = 'STUDENT_DATABASE',
  StudentManagement = 'STUDENT_MANAGEMENT'
}
