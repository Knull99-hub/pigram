import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Heart, Bookmark, MessageCircle, MoreHorizontal, Trash2 } from 'lucide-react';
import { postsApi } from '../../api/posts';
import { likesApi } from '../../api/likes';
import { savesApi } from '../../api/saves';
import { useAuthStore } from '../../store/auth.store';
import Avatar from '../ui/Avatar';
import Modal from '../ui/Modal';
import CommentList from './CommentList';
import type { Post } from '../../types';

interface PostModalProps {
  post: Post | null;
  onClose: () => void;
}

export default function PostModal({ post, onClose }: PostModalProps) {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [showOptions, setShowOptions] = useState(false);

  const { data: freshPost } = useQuery({
    queryKey: ['post', post?.id],
    queryFn: () => postsApi.getById(post!.id),
    enabled: !!post,
    initialData: post ?? undefined,
  });

  const currentPost = freshPost ?? post;

  const likeMut = useMutation({
    mutationFn: () => currentPost!.liked ? likesApi.unlike(currentPost!.id) : likesApi.like(currentPost!.id),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ['post', currentPost!.id] });
      qc.setQueryData<Post>(['post', currentPost!.id], (old) =>
        old ? { ...old, liked: !old.liked, likeCount: old.liked ? old.likeCount - 1 : old.likeCount + 1 } : old
      );
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['post', currentPost!.id] });
      qc.invalidateQueries({ queryKey: ['feed'] });
    },
  });

  const saveMut = useMutation({
    mutationFn: () => currentPost!.saved ? savesApi.unsave(currentPost!.id) : savesApi.save(currentPost!.id),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ['post', currentPost!.id] });
      qc.setQueryData<Post>(['post', currentPost!.id], (old) =>
        old ? { ...old, saved: !old.saved } : old
      );
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['post', currentPost!.id] });
      qc.invalidateQueries({ queryKey: ['saved'] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: () => postsApi.delete(currentPost!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['feed'] });
      qc.invalidateQueries({ queryKey: ['profile-posts'] });
      onClose();
    },
  });

  if (!currentPost) return null;

  const isOwner = user?.id === currentPost.creatorId;

  return (
    <Modal open={!!post} onClose={onClose} className="w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row">
      <div className="md:w-3/5 bg-black flex items-center justify-center">
        <img src={currentPost.imageUrl} alt={currentPost.caption} className="w-full max-h-[90vh] object-contain" />
      </div>

      <div className="md:w-2/5 flex flex-col border-l border-gray-200 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-2">
            <Link to={`/profile/${currentPost.creatorUsername}`} onClick={onClose}>
              <Avatar src={currentPost.creatorAvatarUrl} alt={currentPost.creatorUsername} size="sm" />
            </Link>
            <Link to={`/profile/${currentPost.creatorUsername}`} onClick={onClose} className="font-semibold text-sm hover:underline">
              {currentPost.creatorUsername}
            </Link>
          </div>
          {isOwner && (
            <div className="relative">
              <button onClick={() => setShowOptions(!showOptions)} className="p-1 hover:bg-gray-100 rounded-full">
                <MoreHorizontal size={20} />
              </button>
              {showOptions && (
                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-36">
                  <button
                    onClick={() => deleteMut.mutate()}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Trash2 size={14} /> Delete Post
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {currentPost.caption && (
          <div className="flex gap-2 p-3 border-b">
            <Avatar src={currentPost.creatorAvatarUrl} alt={currentPost.creatorUsername} size="xs" />
            <div>
              <span className="text-sm">
                <Link to={`/profile/${currentPost.creatorUsername}`} onClick={onClose} className="font-semibold mr-2 hover:underline">
                  {currentPost.creatorUsername}
                </Link>
                {currentPost.caption}
              </span>
              {currentPost.tags?.length > 0 && (
                <p className="text-sm text-blue-500 mt-1">{currentPost.tags.map(t => `#${t}`).join(' ')}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {formatDistanceToNow(new Date(currentPost.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-hidden">
          <CommentList postId={currentPost.id} />
        </div>

        {user && (
          <div className="border-t p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => likeMut.mutate()}
                  className={`transition-transform active:scale-90 ${currentPost.liked ? 'text-red-500' : 'text-gray-700 hover:text-gray-500'}`}
                >
                  <Heart size={24} fill={currentPost.liked ? 'currentColor' : 'none'} />
                </button>
                <button className="text-gray-700 hover:text-gray-500">
                  <MessageCircle size={24} />
                </button>
              </div>
              <button
                onClick={() => saveMut.mutate()}
                className={currentPost.saved ? 'text-gray-900' : 'text-gray-700 hover:text-gray-500'}
              >
                <Bookmark size={24} fill={currentPost.saved ? 'currentColor' : 'none'} />
              </button>
            </div>
            <p className="text-sm font-semibold">{currentPost.likeCount.toLocaleString()} likes</p>
            <p className="text-xs text-gray-400 uppercase tracking-wide">
              {formatDistanceToNow(new Date(currentPost.createdAt), { addSuffix: true })}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
