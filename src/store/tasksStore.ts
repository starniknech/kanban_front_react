import { create } from 'zustand';
import { RealtimeService } from '../services/RealtimeService';
import { TasksService } from '../services/TasksService';
import { CreateTaskPayload, MoveTaskPayload, RealtimeEmitEvent, Task, TaskStatus, UpdateTaskPayload } from '../types/domain';
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
  optimisticMoveTasks: (updates: Array<{ taskId: string; status: TaskStatus; position: number }>) => void;
  replaceTasks: (tasks: Task[]) => void;
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
    const task = await RealtimeService.emitProject<Task>(RealtimeEmitEvent.TASK_CREATE, {
      projectId,
      ...payload,
    });
    get().upsertTask(task);
    return task;
  },

  updateTask: async (projectId, taskId, payload) => {
    const task = await RealtimeService.emitProject<Task | null>(RealtimeEmitEvent.TASK_UPDATE, {
      projectId,
      taskId,
      ...payload,
    });
    if (!task) throw new Error('Task was not updated');
    get().upsertTask(task);
    set({ currentTask: task });
    return task;
  },

  moveTask: async (projectId, taskId, payload) => {
    const task = await RealtimeService.emitProject<Task | null>(RealtimeEmitEvent.TASK_MOVE, {
      projectId,
      taskId,
      ...payload,
    });
    if (!task) throw new Error('Task was not moved');
    get().upsertTask(task);
    return task;
  },

  deleteTask: async (projectId, taskId) => {
    const task = await RealtimeService.emitProject<Task | null>(RealtimeEmitEvent.TASK_DELETE, {
      projectId,
      taskId,
    });
    get().removeTask(task || taskId);
  },

  optimisticMoveTasks: (updates) => {
    if (updates.length === 0) return;

    const updatesByTaskId = new Map(updates.map((update) => [update.taskId, update]));

    set({
      tasks: get().tasks.map((task) => {
        const update = updatesByTaskId.get(getEntityId(task));
        return update ? { ...task, status: update.status, position: update.position } : task;
      }),
    });
  },

  replaceTasks: (tasks) => set({ tasks }),

  upsertTask: (task) => {
    if (!task) return;
    const taskId = getEntityId(task);
    const exists = get().tasks.some((item) => getEntityId(item) === taskId);
    set({
      currentTask: getEntityId(get().currentTask) === taskId ? task : get().currentTask,
      tasks: exists
        ? get().tasks.map((item) => (getEntityId(item) === taskId ? task : item))
        : [task, ...get().tasks],
    });
  },

  removeTask: (task) => {
    if (!task) return;
    const taskId = typeof task === 'string' ? task : getEntityId(task);
    set({
      currentTask: getEntityId(get().currentTask) === taskId ? null : get().currentTask,
      tasks: get().tasks.filter((item) => getEntityId(item) !== taskId),
    });
  },
}));
