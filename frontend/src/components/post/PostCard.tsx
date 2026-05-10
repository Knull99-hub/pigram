import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Bookmark, MoreHorizontal, MapPin, Users } from 'lucide-react';
import { likesApi } from '../../api/likes';
import { savesApi } from '../../api/saves';
import { ratingsApi } from '../../api/ratings';
import { useAuthStore } from '../../store/auth.store';
import Avatar from '../ui/Avatar';
import StarRating from '../ui/StarRating';
import type { Post } from '../../types';

interface PostCardProps {
  post: Post;
  onOpenComments?: (post: Post) => void;
}

export default function PostCard({ post, onOpenComments }: PostCardProps) {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const lastTap = useRef(0);
  const [showHeart, setShowHeart] = useState(false);

  const update = (updates: Partial<Post>) => {
    qc.setQueryData<Post[]>(['feed'], (old) =>
      old?.map((p) => (p.id === post.id ? { ...p, ...updates } : p))
    );
    qc.setQueryData<Post[]>(['discover'], (old) =>
      old?.map((p) => (p.id === post.id ? { ...p, ...updates } : p))
    );
  };

  const likeMut = useMutation({
    mutationFn: () => post.liked ? likesApi.unlike(post.id) : likesApi.like(post.id),
    onMutate: () => update({ liked: !post.liked, likeCount: post.liked ? post.likeCount - 1 : post.likeCount + 1 }),
    onError: () => update({ liked: post.liked, likeCount: post.likeCount }),
  });

  const saveMut = useMutation({
    mutationFn: () => post.saved ? savesApi.unsave(post.id) : savesApi.save(post.id),
    onMutate: () => update({ saved: !post.saved }),
    onError: () => update({ saved: post.saved }),
  });

  const rateMut = useMutation({
    mutationFn: (value: number) => ratingsApi.rate(post.id, value),
    onMutate: (value) => update({ userRating: value }),
  });

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      if (!post.liked) likeMut.mutate();
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 900);
    }
    lastTap.current = now;
  };

  return (
    <article className="bg-white border border-gray-200 rounded-lg max-w-lg w-full">
      <div className="flex items-center justify-between p-3">
        <Link to={`/profile/${post.creatorUsername}`} className="flex items-center gap-2">
          <Avatar src={post.creatorAvatarUrl} alt={post.creatorUsername} size="sm" />
          <span className="font-semibold text-sm">{post.creatorUsername}</span>
        </Link>
        <MoreHorizontal size={20} className="text-gray-700 cursor-pointer" />
      </div>

      <div className="relative select-none" onClick={handleDoubleTap}>
        <img
          src={post.imageUrl}
          alt={post.caption}
          className="w-full object-cover"
          style={{ maxHeight: 600 }}
          draggable={false}
        />
        {showHeart && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Heart size={80} fill="white" className="text-white opacity-90 animate-ping" style={{ animationDuration: '0.5s', animationIterationCount: 1 }} />
          </div>
        )}
      </div>

      {user && (
        <div className="p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => likeMut.mutate()}
                className={`transition-transform active:scale-90 ${post.liked ? 'text-red-500' : 'text-gray-700 hover:text-gray-500'}`}
              >
                <Heart size={24} fill={post.liked ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={() => onOpenComments?.(post)}
                className="text-gray-700 hover:text-gray-500"
              >
                <MessageCircle size={24} />
              </button>
            </div>
            <button
              onClick={() => saveMut.mutate()}
              className={post.saved ? 'text-gray-900' : 'text-gray-700 hover:text-gray-500'}
            >
              <Bookmark size={24} fill={post.saved ? 'currentColor' : 'none'} />
            </button>
          </div>

          {post.likeCount > 0 && (
            <p className="text-sm font-semibold">{post.likeCount.toLocaleString()} likes</p>
          )}

          {post.title && (
            <p className="text-sm font-semibold">{post.title}</p>
          )}

          {post.caption && (
            <p className="text-sm">
              <Link to={`/profile/${post.creatorUsername}`} className="font-semibold mr-2">{post.creatorUsername}</Link>
              {post.caption}
            </p>
          )}

          {post.location && (
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <MapPin size={12} /> {post.location}
            </p>
          )}

          {post.peoplePresent?.length > 0 && (
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Users size={12} /> {post.peoplePresent.join(', ')}
            </p>
          )}

          {post.tags?.length > 0 && (
            <p className="text-sm text-blue-500">{post.tags.map(t => `#${t}`).join(' ')}</p>
          )}

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <StarRating
                value={post.userRating ?? 0}
                onChange={user?.role === 'consumer' ? (v) => rateMut.mutate(v) : undefined}
                readonly={user?.role !== 'consumer'}
              />
              {post.ratingCount > 0 && (
                <span className="text-xs text-gray-400">
                  {(post.ratingSum / post.ratingCount).toFixed(1)} ({post.ratingCount})
                </span>
              )}
            </div>
          </div>

          {post.commentCount > 0 && (
            <button
              onClick={() => onOpenComments?.(post)}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              View all {post.commentCount} comments
            </button>
          )}

          <p className="text-xs text-gray-400 uppercase tracking-wide">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </p>
        </div>
      )}
    </article>
  );
}
