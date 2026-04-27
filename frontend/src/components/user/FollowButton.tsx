import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { followsApi } from '../../api/follows';
import { useAuthStore } from '../../store/auth.store';

interface FollowButtonProps {
  targetId: string;
  targetUsername: string;
  initialFollowing?: boolean;
}

export default function FollowButton({ targetId, targetUsername, initialFollowing }: FollowButtonProps) {
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['following-status', targetId],
    queryFn: () => followsApi.isFollowing(targetId),
    enabled: !!user && user.id !== targetId,
    initialData: initialFollowing !== undefined ? { following: initialFollowing } : undefined,
  });

  const isFollowing = data?.following ?? false;

  const followMut = useMutation({
    mutationFn: () => isFollowing ? followsApi.unfollow(targetId) : followsApi.follow(targetId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['following-status', targetId] });
      qc.invalidateQueries({ queryKey: ['profile', targetUsername] });
    },
  });

  if (!user || user.id === targetId) return null;

  return (
    <button
      onClick={() => followMut.mutate()}
      disabled={followMut.isPending || isLoading}
      className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
        isFollowing
          ? 'border border-gray-300 text-gray-700 hover:bg-gray-50'
          : 'bg-blue-500 text-white hover:bg-blue-600'
      } disabled:opacity-50`}
    >
      {isFollowing ? 'Following' : 'Follow'}
    </button>
  );
}
