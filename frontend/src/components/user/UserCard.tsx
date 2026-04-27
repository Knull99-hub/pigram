import { Link } from 'react-router-dom';
import Avatar from '../ui/Avatar';
import FollowButton from './FollowButton';
import type { User } from '../../types';

interface UserCardProps {
  user: User;
}

export default function UserCard({ user }: UserCardProps) {
  return (
    <div className="flex items-center gap-3 p-3">
      <Link to={`/profile/${user.username}`}>
        <Avatar src={user.avatarUrl} alt={user.username} size="md" />
      </Link>
      <div className="flex-1 min-w-0">
        <Link to={`/profile/${user.username}`} className="font-semibold text-sm text-gray-900 hover:underline block truncate">
          {user.username}
        </Link>
        <p className="text-sm text-gray-500 truncate">{user.displayName}</p>
      </div>
      <FollowButton targetId={user.id} targetUsername={user.username} />
    </div>
  );
}
