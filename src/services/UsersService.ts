import { ApiService } from './ApiService';
import { User } from '../types/domain';

export class UsersService {
  static async getMe() {
    const { data } = await ApiService.instance.get<User>('/users/me');
    return data;
  }

  static async updateUser(userId: string, payload: { name?: string; email?: string; avatar?: File }) {
    const formData = new FormData();

    if (payload.name) formData.append('name', payload.name);
    if (payload.email) formData.append('email', payload.email);
    if (payload.avatar) formData.append('avatar', payload.avatar);

    const { data } = await ApiService.instance.patch<User>('/users/' + userId, formData);
    return data;
  }
}
