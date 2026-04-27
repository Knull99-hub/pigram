import client from './client';
import type { User } from '../types';

export const usersApi = {
  getProfile: (username: string) =>
    client.get<User>(`/users/${username}`).then((r) => r.data),

  updateProfile: (data: { displayName?: string; bio?: string; website?: string; location?: string }) =>
    client.patch<User>('/users/me', data).then((r) => r.data),

  updateAvatar: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return client.post<User>('/users/me/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },

  getFollowers: (userId: string) =>
    client.get<User[]>(`/users/${userId}/followers`).then((r) => r.data),

  getFollowing: (userId: string) =>
    client.get<User[]>(`/users/${userId}/following`).then((r) => r.data),
};
