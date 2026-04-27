import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Heart, UserPlus, MessageCircle } from 'lucide-react';
import { notificationsApi } from '../api/notifications';
import Layout from '../components/layout/Layout';
import Avatar from '../components/ui/Avatar';
import Spinner from '../components/ui/Spinner';

const typeIcon = {
  follow: <UserPlus size={16} className="text-blue-500" />,
  like: <Heart size={16} className="text-red-500" />,
  comment: <MessageCircle size={16} className="text-green-500" />,
};

const typeText = {
  follow: 'started following you.',
  like: 'liked your post.',
  comment: 'commented on your post.',
};

export default function NotificationsPage() {
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsApi.getAll,
  });

  const markReadMut = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
  });

  useEffect(() => {
    const unread = notifications.filter((n) => !n.isRead);
    unread.forEach((n) => markReadMut.mutate(n.id));
  }, [notifications]);

  return (
    <Layout>
      <div className="max-w-lg mx-auto py-6 px-4">
        <h1 className="text-lg font-semibold mb-4">Notifications</h1>

        {isLoading && <div className="flex justify-center py-8"><Spinner /></div>}

        {!isLoading && notifications.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">🔔</p>
            <p className="font-semibold">No notifications yet</p>
          </div>
        )}

        <div className="space-y-1">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-center gap-3 p-3 rounded-lg ${!n.isRead ? 'bg-blue-50' : 'hover:bg-gray-50'} transition-colors`}
            >
              <Link to={`/profile/${n.actorUsername}`}>
                <Avatar src={n.actorAvatarUrl} alt={n.actorUsername} size="md" />
              </Link>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <Link to={`/profile/${n.actorUsername}`} className="font-semibold hover:underline">
                    {n.actorUsername}
                  </Link>{' '}
                  {typeText[n.type]}
                </p>
                <p className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </p>
              </div>
              <div className="flex-shrink-0">{typeIcon[n.type]}</div>
              {n.entityType === 'post' && (
                <Link to={`/p/${n.entityId}`} className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gray-200 rounded" />
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
