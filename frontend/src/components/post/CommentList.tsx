import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { postsApi } from '../../api/posts';
import { useAuthStore } from '../../store/auth.store';
import Avatar from '../ui/Avatar';
import Spinner from '../ui/Spinner';

interface CommentListProps {
  postId: string;
}

export default function CommentList({ postId }: CommentListProps) {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [text, setText] = useState('');

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => postsApi.getComments(postId),
  });

  const addMut = useMutation({
    mutationFn: () => postsApi.addComment(postId, text),
    onSuccess: () => {
      setText('');
      qc.invalidateQueries({ queryKey: ['comments', postId] });
      qc.invalidateQueries({ queryKey: ['post', postId] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: (commentId: string) => postsApi.deleteComment(postId, commentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments', postId] });
      qc.invalidateQueries({ queryKey: ['post', postId] });
    },
  });

  if (isLoading) return <div className="flex justify-center p-4"><Spinner size="sm" /></div>;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-3 p-4">
        {comments.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">No comments yet. Be first!</p>
        )}
        {comments.map((c) => (
          <div key={c.id} className="flex gap-2 group">
            <Link to={`/profile/${c.authorUsername}`}>
              <Avatar src={c.authorAvatarUrl} alt={c.authorUsername} size="xs" />
            </Link>
            <div className="flex-1">
              <span className="text-sm">
                <Link to={`/profile/${c.authorUsername}`} className="font-semibold text-gray-900 hover:underline mr-2">
                  {c.authorUsername}
                </Link>
                {c.text}
              </span>
              <p className="text-xs text-gray-400 mt-0.5">
                {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
              </p>
            </div>
            {user && (user.id === c.authorId) && (
              <button
                onClick={() => deleteMut.mutate(c.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      {user && (
        <div className="border-t p-3 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 text-sm outline-none placeholder-gray-400"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && text.trim()) {
                e.preventDefault();
                addMut.mutate();
              }
            }}
          />
          <button
            onClick={() => addMut.mutate()}
            disabled={!text.trim() || addMut.isPending}
            className="text-blue-500 font-semibold text-sm disabled:opacity-40"
          >
            Post
          </button>
        </div>
      )}
    </div>
  );
}
