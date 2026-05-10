import client from './client';

export const ratingsApi = {
  rate: (postId: string, value: number) =>
    client.post<{ rating: number }>(`/posts/${postId}/rate`, { value }).then((r) => r.data),

  getMyRating: (postId: string) =>
    client.get<{ value: number }>(`/posts/${postId}/rating`).then((r) => r.data),
};
