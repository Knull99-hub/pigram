import client from './client';
import type { Post } from '../types';

export const savesApi = {
  save: (postId: string) =>
    client.post(`/posts/${postId}/save`).then((r) => r.data),

  unsave: (postId: string) =>
    client.delete(`/posts/${postId}/save`).then((r) => r.data),

  getSaved: () =>
    client.get<Post[]>('/users/me/saved').then((r) => r.data),
};
