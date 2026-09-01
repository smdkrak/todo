export type TaskStatus = 'todo' | 'doing' | 'done';

export interface Category {
  id: string;
  name: string;
}

export interface Notice {
  id: string;
  text: string;
  date?: string;
}

export interface Task {
  id: string;
  title: string;
  deadline?: string;
  content?: string;
  imageUrl?: string;
  status: TaskStatus;
  category: string; // id of category
  classification: string; // priority -> classification
}
