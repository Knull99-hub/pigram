import client from './client';
import type { Post } from '../types';

export const feedApi = {
  getFeed: (limit = 20, offset = 0) =>
    client.get<Post[]>('/posts/feed', { params: { limit, offset } }).then((r) => r.data),
};
