import { Heart, MessageCircle } from 'lucide-react';
import type { Post } from '../../types';

interface ImageGridProps {
  posts: Post[];
  onPostClick: (post: Post) => void;
}

export default function ImageGrid({ posts, onPostClick }: ImageGridProps) {
  return (
    <div className="grid grid-cols-3 gap-1">
      {posts.map((post) => (
        <button
          key={post.id}
          className="relative group aspect-square overflow-hidden bg-gray-100"
          onClick={() => onPostClick(post)}
        >
          <img
            src={post.imageUrl}
            alt={post.caption}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100">
            <span className="flex items-center gap-1 text-white font-semibold text-sm">
              <Heart size={18} fill="white" /> {post.likeCount}
            </span>
            <span className="flex items-center gap-1 text-white font-semibold text-sm">
              <MessageCircle size={18} fill="white" /> {post.commentCount}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
