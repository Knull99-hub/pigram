import client from './client';

export const likesApi = {
  like: (postId: string) =>
    client.post(`/posts/${postId}/like`).then((r) => r.data),

  unlike: (postId: string) =>
    client.delete(`/posts/${postId}/like`).then((r) => r.data),
};
