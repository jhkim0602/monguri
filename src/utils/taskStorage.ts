// 🔧 Task 저장소 유틸리티 (localStorage 활용)

export interface Task {
  id: string;
  title: string;
  categoryId: string;
  description?: string;
  status?: string;
  badgeColor?: string;
  completed: boolean;
  timeSpent: number;
  isRunning: boolean;
  isMentorTask: boolean;
  studyRecord: { photo?: string; note?: string } | null;
  userQuestion?: string;
  hasMentorResponse?: boolean;
  mentorComment?: string;
  attachments?: any[];
  submissions?: any[];
  feedbackFiles?: any[];
  startTime?: string;
  endTime?: string;
}

const STORAGE_KEY = 'mentee-tasks';

export const TaskStorage = {
  // 모든 동적 생성 tasks 조회
  getAllDynamicTasks(): Task[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  // 특정 task 조회
  getTaskById(id: string): Task | null {
    const tasks = this.getAllDynamicTasks();
    return tasks.find(t => t.id === id) || null;
  },

  // Task 저장 (생성 또는 업데이트)
  saveTask(task: Task): void {
    const tasks = this.getAllDynamicTasks();
    const existingIndex = tasks.findIndex(t => t.id === task.id);
    
    if (existingIndex >= 0) {
      tasks[existingIndex] = task;
    } else {
      tasks.push(task);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  },

  // Task 삭제
  deleteTask(id: string): void {
    const tasks = this.getAllDynamicTasks();
    const filtered = tasks.filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },

  // 모든 tasks 업데이트 (일괄)
  saveTasks(tasks: Task[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }
};
