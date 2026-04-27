import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { feedApi } from '../api/feed';
import { useAuthStore } from '../store/auth.store';
import Layout from '../components/layout/Layout';
import PostCard from '../components/post/PostCard';
import PostModal from '../components/post/PostModal';
import Spinner from '../components/ui/Spinner';
import type { Post } from '../types';

export default function FeedPage() {
  const { user } = useAuthStore();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['feed'],
    queryFn: () => feedApi.getFeed(),
    enabled: !!user,
  });

  return (
    <Layout>
      <div className="max-w-lg mx-auto py-6 px-4 space-y-6">
        {isLoading && (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        )}

        {!isLoading && posts.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg font-semibold mb-2">Your feed is empty</p>
            <p className="text-sm">Follow some creators or explore posts to get started.</p>
          </div>
        )}

        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onOpenComments={setSelectedPost}
          />
        ))}
      </div>

      <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} />
    </Layout>
  );
}
