import client from './client';

export const followsApi = {
  follow: (targetId: string) =>
    client.post(`/users/${targetId}/follow`).then((r) => r.data),

  unfollow: (targetId: string) =>
    client.delete(`/users/${targetId}/follow`).then((r) => r.data),

  isFollowing: (targetId: string) =>
    client.get<{ following: boolean }>(`/users/${targetId}/follow/status`).then((r) => r.data),
};
