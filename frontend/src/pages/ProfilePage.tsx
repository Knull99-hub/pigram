import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Settings } from 'lucide-react';
import { usersApi } from '../api/users';
import { postsApi } from '../api/posts';
import { useAuthStore } from '../store/auth.store';
import Layout from '../components/layout/Layout';
import Avatar from '../components/ui/Avatar';
import FollowButton from '../components/user/FollowButton';
import UserCard from '../components/user/UserCard';
import ImageGrid from '../components/ui/ImageGrid';
import PostModal from '../components/post/PostModal';
import Modal from '../components/ui/Modal';
import Spinner from '../components/ui/Spinner';
import type { Post } from '../types';

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user: me } = useAuthStore();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [followModal, setFollowModal] = useState<'followers' | 'following' | null>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => usersApi.getProfile(username!),
    enabled: !!username,
  });

  const { data: posts = [] } = useQuery({
    queryKey: ['profile-posts', profile?.id],
    queryFn: () => postsApi.getUserPosts(profile!.id, 30),
    enabled: !!profile?.id,
  });

  const { data: followers = [] } = useQuery({
    queryKey: ['followers', profile?.id],
    queryFn: () => usersApi.getFollowers(profile!.id),
    enabled: followModal === 'followers' && !!profile,
  });

  const { data: following = [] } = useQuery({
    queryKey: ['following', profile?.id],
    queryFn: () => usersApi.getFollowing(profile!.id),
    enabled: followModal === 'following' && !!profile,
  });

  if (isLoading) return <Layout><div className="flex justify-center py-12"><Spinner size="lg" /></div></Layout>;
  if (!profile) return <Layout><div className="text-center py-12 text-gray-500">User not found</div></Layout>;

  const isMe = me?.id === profile.id;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-start gap-8 mb-8">
          <Avatar src={profile.avatarUrl} alt={profile.username} size="xl" />

          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4 flex-wrap">
              <h1 className="text-xl font-semibold">{profile.username}</h1>
              {isMe ? (
                <Link
                  to="/account/edit"
                  className="border border-gray-300 text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-gray-50"
                >
                  Edit profile
                </Link>
              ) : (
                <FollowButton targetId={profile.id} targetUsername={profile.username} />
              )}
              {isMe && (
                <Link to="/account/edit">
                  <Settings size={20} className="text-gray-700" />
                </Link>
              )}
            </div>

            <div className="flex gap-6 mb-4 text-sm">
              <span><strong>{profile.postCount}</strong> posts</span>
              <button className="hover:underline" onClick={() => setFollowModal('followers')}>
                <strong>{profile.followerCount}</strong> followers
              </button>
              <button className="hover:underline" onClick={() => setFollowModal('following')}>
                <strong>{profile.followingCount}</strong> following
              </button>
            </div>

            <div>
              <p className="font-semibold text-sm">{profile.displayName}</p>
              {profile.bio && <p className="text-sm mt-1 whitespace-pre-wrap">{profile.bio}</p>}
              {profile.website && (
                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">
                  {profile.website}
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-300 pt-4">
          {posts.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-3">📷</p>
              <p className="font-semibold">No posts yet</p>
            </div>
          ) : (
            <ImageGrid posts={posts} onPostClick={setSelectedPost} />
          )}
        </div>
      </div>

      <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} />

      <Modal
        open={!!followModal}
        onClose={() => setFollowModal(null)}
        className="w-full max-w-xs max-h-96 overflow-y-auto"
      >
        <div className="p-4">
          <h2 className="font-semibold text-center mb-4 capitalize">{followModal}</h2>
          {(followModal === 'followers' ? followers : following).map((u) => (
            <UserCard key={u.id} user={u} />
          ))}
        </div>
      </Modal>
    </Layout>
  );
}
