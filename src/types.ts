export interface LogEntry {
  timestamp: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  message: string;
}

export interface HardwareItem {
  component: string;
  spec: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  techStack: string[];
  longDescription: string;
  hardwareSpec: HardwareItem[];
  softwareDetails: string;
  codeSnippet: string;
  simulateLogs: LogEntry[];
}

export interface Experience {
  id: string;
  year: string;
  title: string;
  team?: string;
  role?: string;
  description: string;
  detailedPoints: string[];
}

export interface Skill {
  name: string;
  category: 'Coding' | 'Engineering' | 'Methodology';
  proficiency: number; // Percentage, e.g., 90
}

export interface Award {
  id: string;
  year: string;
  title: string;
  category: string;
  rank: string;
}
