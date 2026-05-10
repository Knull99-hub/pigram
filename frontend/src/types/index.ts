export interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  website: string;
  location: string;
  role: 'creator' | 'consumer';
  followerCount: number;
  followingCount: number;
  postCount: number;
  createdAt: string;
}

export interface Post {
  id: string;
  creatorId: string;
  creatorUsername: string;
  creatorAvatarUrl: string;
  imageUrl: string;
  title: string;
  caption: string;
  location: string;
  peoplePresent: string[];
  tags: string[];
  likeCount: number;
  commentCount: number;
  saveCount: number;
  ratingCount: number;
  ratingSum: number;
  liked?: boolean;
  saved?: boolean;
  userRating?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorUsername: string;
  authorAvatarUrl: string;
  text: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  actorId: string;
  actorUsername: string;
  actorAvatarUrl: string;
  type: 'follow' | 'like' | 'comment';
  entityId: string;
  entityType: 'user' | 'post' | 'comment';
  isRead: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface PaginatedPosts {
  posts: Post[];
  total: number;
}

export interface SearchResult {
  users: User[];
  posts: Post[];
}
