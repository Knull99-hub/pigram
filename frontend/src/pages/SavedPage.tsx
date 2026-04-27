import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { savesApi } from '../api/saves';
import Layout from '../components/layout/Layout';
import ImageGrid from '../components/ui/ImageGrid';
import PostModal from '../components/post/PostModal';
import Spinner from '../components/ui/Spinner';
import type { Post } from '../types';

export default function SavedPage() {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['saved'],
    queryFn: savesApi.getSaved,
  });

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-6 px-4">
        <h1 className="text-lg font-semibold mb-4">Saved</h1>

        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">🔖</p>
            <p className="font-semibold">No saved posts yet</p>
            <p className="text-sm mt-1">Save posts to see them here.</p>
          </div>
        ) : (
          <ImageGrid posts={posts} onPostClick={setSelectedPost} />
        )}
      </div>
      <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} />
    </Layout>
  );
}
