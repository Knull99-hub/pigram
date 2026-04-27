export interface Post {
    id: string;
    creatorId: string;
    creatorUsername: string;
    creatorAvatarUrl: string;
    imageUrl: string;
    blobName: string;
    caption: string;
    location: string;
    peoplePresent: string[];
    tags: string[];
    likeCount: number;
    commentCount: number;
    saveCount: number;
    createdAt: string;
    updatedAt: string;
}
