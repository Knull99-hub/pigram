import client from './client';
import type { Post, Comment } from '../types';

export const postsApi = {
  create: (data: { title: string; caption: string; location: string; peoplePresent: string[]; tags: string[]; file: File }) => {
    const form = new FormData();
    form.append('file', data.file);
    form.append('title', data.title);
    form.append('caption', data.caption);
    form.append('location', data.location);
    form.append('peoplePresent', JSON.stringify(data.peoplePresent));
    form.append('tags', JSON.stringify(data.tags));
    return client.post<Post>('/posts', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },

  getById: (id: string) =>
    client.get<Post>(`/posts/${id}`).then((r) => r.data),

  getUserPosts: (userId: string, limit = 12, offset = 0) =>
    client.get<Post[]>(`/posts/user/${userId}`, { params: { limit, offset } }).then((r) => r.data),

  getDiscover: (limit = 20, offset = 0) =>
    client.get<Post[]>('/posts/discover', { params: { limit, offset } }).then((r) => r.data),

  update: (id: string, data: { caption?: string; tags?: string[] }) =>
    client.patch<Post>(`/posts/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    client.delete(`/posts/${id}`).then((r) => r.data),

  getComments: (postId: string) =>
    client.get<Comment[]>(`/posts/${postId}/comments`).then((r) => r.data),

  addComment: (postId: string, text: string) =>
    client.post<Comment>(`/posts/${postId}/comments`, { content: text }).then((r) => r.data),

  deleteComment: (_postId: string, commentId: string) =>
    client.delete(`/comments/${commentId}`).then((r) => r.data),
};
