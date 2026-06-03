import { ApiService } from './ApiService';
import { CreateTaskPayload, MoveTaskPayload, Task, UpdateTaskPayload } from '../types/domain';

export class TasksService {
  static async listTasks(projectId: string) {
    const { data } = await ApiService.instance.get<Task[]>('/projects/' + projectId + '/tasks');
    return data;
  }

  static async createTask(projectId: string, payload: CreateTaskPayload) {
    const { data } = await ApiService.instance.post<Task>('/projects/' + projectId + '/tasks', payload);
    return data;
  }

  static async getTask(projectId: string, taskId: string) {
    const { data } = await ApiService.instance.get<Task>('/projects/' + projectId + '/tasks/' + taskId);
    return data;
  }

  static async updateTask(projectId: string, taskId: string, payload: UpdateTaskPayload) {
    const { data } = await ApiService.instance.patch<Task>(
      '/projects/' + projectId + '/tasks/' + taskId,
      payload,
    );
    return data;
  }

  static async moveTask(projectId: string, taskId: string, payload: MoveTaskPayload) {
    const { data } = await ApiService.instance.patch<Task>(
      '/projects/' + projectId + '/tasks/' + taskId + '/move',
      payload,
    );
    return data;
  }

  static async deleteTask(projectId: string, taskId: string) {
    const { data } = await ApiService.instance.delete<Task>('/projects/' + projectId + '/tasks/' + taskId);
    return data;
  }
}
