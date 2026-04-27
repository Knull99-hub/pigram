export interface User {
  id: string;
  email: string;
  passwordHash: string;
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

export type PublicUser = Omit<User, 'passwordHash' | 'email'>;
