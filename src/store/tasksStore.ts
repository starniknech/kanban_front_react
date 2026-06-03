import { create } from 'zustand';
import { TasksService } from '../services/TasksService';
import { CreateTaskPayload, MoveTaskPayload, Task, UpdateTaskPayload } from '../types/domain';
import { getEntityId } from '../utils/entity';

interface TasksState {
  tasks: Task[];
  currentTask: Task | null;
  isLoading: boolean;
  fetchTasks: (projectId: string) => Promise<void>;
  fetchTask: (projectId: string, taskId: string) => Promise<void>;
  createTask: (projectId: string, payload: CreateTaskPayload) => Promise<Task>;
  updateTask: (projectId: string, taskId: string, payload: UpdateTaskPayload) => Promise<Task>;
  moveTask: (projectId: string, taskId: string, payload: MoveTaskPayload) => Promise<Task>;
  deleteTask: (projectId: string, taskId: string) => Promise<void>;
  upsertTask: (task: Task | null) => void;
  removeTask: (task: Task | string | null) => void;
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  currentTask: null,
  isLoading: false,

  fetchTasks: async (projectId) => {
    set({ isLoading: true });
    const tasks = await TasksService.listTasks(projectId);
    set({ tasks, isLoading: false });
  },

  fetchTask: async (projectId, taskId) => {
    set({ isLoading: true });
    const currentTask = await TasksService.getTask(projectId, taskId);
    set({ currentTask, isLoading: false });
  },

  createTask: async (projectId, payload) => {
    const task = await TasksService.createTask(projectId, payload);
    get().upsertTask(task);
    return task;
  },

  updateTask: async (projectId, taskId, payload) => {
    const task = await TasksService.updateTask(projectId, taskId, payload);
    get().upsertTask(task);
    set({ currentTask: task });
    return task;
  },

  moveTask: async (projectId, taskId, payload) => {
    const task = await TasksService.moveTask(projectId, taskId, payload);
    get().upsertTask(task);
    return task;
  },

  deleteTask: async (projectId, taskId) => {
    await TasksService.deleteTask(projectId, taskId);
    get().removeTask(taskId);
  },

  upsertTask: (task) => {
    if (!task) return;
    const taskId = getEntityId(task);
    const exists = get().tasks.some((item) => getEntityId(item) === taskId);
    set({
      tasks: exists
        ? get().tasks.map((item) => (getEntityId(item) === taskId ? task : item))
        : [task, ...get().tasks],
    });
  },

  removeTask: (task) => {
    if (!task) return;
    const taskId = typeof task === 'string' ? task : getEntityId(task);
    set({ tasks: get().tasks.filter((item) => getEntityId(item) !== taskId) });
  },
}));
