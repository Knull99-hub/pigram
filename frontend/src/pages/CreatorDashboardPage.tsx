import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PlusSquare, Image, Heart, Users } from 'lucide-react';
import { postsApi } from '../api/posts';
import { useAuthStore } from '../store/auth.store';
import Layout from '../components/layout/Layout';
import Spinner from '../components/ui/Spinner';

export default function CreatorDashboardPage() {
  const { user } = useAuthStore();

  const { data: posts, isLoading } = useQuery({
    queryKey: ['myPosts', user?.id],
    queryFn: () => postsApi.getUserPosts(user!.id, 50, 0),
    enabled: !!user,
  });

  const totalLikes = posts?.reduce((sum, p) => sum + (p.likeCount || 0), 0) ?? 0;
  const totalRatings = posts?.reduce((sum, p) => sum + (p.ratingCount || 0), 0) ?? 0;
  const avgRating = totalRatings > 0
    ? (posts!.reduce((sum, p) => sum + (p.ratingSum || 0), 0) / totalRatings).toFixed(1)
    : '—';

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Creator Studio</h1>
            <p className="text-gray-500 text-sm">Welcome back, {user?.displayName}</p>
          </div>
          <Link
            to="/create"
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-600 transition-colors"
          >
            <PlusSquare size={18} /> New Post
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <Image size={20} className="mx-auto text-blue-500 mb-1" />
            <p className="text-2xl font-bold">{posts?.length ?? 0}</p>
            <p className="text-xs text-gray-400">Posts</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <Heart size={20} className="mx-auto text-red-500 mb-1" />
            <p className="text-2xl font-bold">{totalLikes}</p>
            <p className="text-xs text-gray-400">Total Likes</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <Users size={20} className="mx-auto text-green-500 mb-1" />
            <p className="text-2xl font-bold">{avgRating}</p>
            <p className="text-xs text-gray-400">Avg Rating</p>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Your Posts</h2>
          {isLoading ? (
            <div className="flex justify-center py-12"><Spinner /></div>
          ) : posts?.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <PlusSquare size={48} className="mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No posts yet</p>
              <Link to="/create" className="text-blue-500 text-sm hover:underline">Share your first photo</Link>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {posts?.map((post) => (
                <Link key={post.id} to={`/p/${post.id}`} className="relative aspect-square group overflow-hidden bg-gray-100">
                  <img src={post.imageUrl} alt={post.title || post.caption} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                    <p className="text-white text-xs font-semibold truncate px-2 max-w-full">{post.title}</p>
                    <div className="flex gap-3 text-white text-xs">
                      <span>♥ {post.likeCount}</span>
                      <span>★ {post.ratingCount > 0 ? (post.ratingSum / post.ratingCount).toFixed(1) : '—'}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
