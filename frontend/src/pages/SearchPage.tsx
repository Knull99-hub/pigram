import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { searchApi } from '../api/search';
import Layout from '../components/layout/Layout';
import UserCard from '../components/user/UserCard';
import PostModal from '../components/post/PostModal';
import ImageGrid from '../components/ui/ImageGrid';
import Spinner from '../components/ui/Spinner';
import type { Post } from '../types';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['search', submitted],
    queryFn: () => searchApi.search(submitted),
    enabled: submitted.length >= 2,
  });

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-6 px-4">
        <div className="relative mb-6">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setSubmitted(query)}
            placeholder="Search users or posts..."
            className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-lg text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-gray-300 transition-all"
          />
        </div>

        {isLoading && <div className="flex justify-center py-8"><Spinner /></div>}

        {data && (
          <>
            {data.users.length > 0 && (
              <section className="mb-8">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">People</h2>
                <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
                  {data.users.map((u) => <UserCard key={u.id} user={u} />)}
                </div>
              </section>
            )}

            {data.posts.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Posts</h2>
                <ImageGrid posts={data.posts} onPostClick={setSelectedPost} />
              </section>
            )}

            {data.users.length === 0 && data.posts.length === 0 && (
              <p className="text-center text-gray-400 py-8">No results for "{submitted}"</p>
            )}
          </>
        )}
      </div>
      <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} />
    </Layout>
  );
}
