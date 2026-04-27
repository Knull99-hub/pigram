import client from './client';
import type { Notification } from '../types';

export const notificationsApi = {
  getAll: () =>
    client.get<Notification[]>('/notifications').then((r) => r.data),

  markRead: (id: string) =>
    client.patch(`/notifications/${id}/read`).then((r) => r.data),
};
