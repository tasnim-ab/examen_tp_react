export interface User {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role?: 'admin' | 'member';
}

export interface Member {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  role?: 'admin' | 'member';
}

export interface TaskType {
  id: number;
  title: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'nouveau' | 'vue' | 'planifiée' | 'en cours' | 'achevée' | 'annulée';
  typeId: number;
  memberId: number;
  createdAt: string;
}

export type TaskStatus = Task['status'];