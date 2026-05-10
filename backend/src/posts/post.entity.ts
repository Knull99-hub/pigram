export interface Post {
  id: string;
  creatorId: string;
  creatorUsername: string;
  creatorAvatarUrl: string;
  imageUrl: string;
  blobName: string;
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
  createdAt: string;
  updatedAt: string;
}
