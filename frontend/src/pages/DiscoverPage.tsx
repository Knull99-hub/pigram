import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { postsApi } from '../api/posts';
import Layout from '../components/layout/Layout';
import ImageGrid from '../components/ui/ImageGrid';
import PostModal from '../components/post/PostModal';
import Spinner from '../components/ui/Spinner';
import type { Post } from '../types';

export default function DiscoverPage() {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['discover'],
    queryFn: () => postsApi.getDiscover(40),
  });

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-6 px-4">
        <h1 className="text-lg font-semibold mb-4">Explore</h1>
        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : (
          <ImageGrid posts={posts} onPostClick={setSelectedPost} />
        )}
      </div>
      <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} />
    </Layout>
  );
}
