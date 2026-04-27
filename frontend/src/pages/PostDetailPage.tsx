import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { postsApi } from '../api/posts';
import Layout from '../components/layout/Layout';
import PostModal from '../components/post/PostModal';
import Spinner from '../components/ui/Spinner';

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: post, isLoading } = useQuery({
    queryKey: ['post', id],
    queryFn: () => postsApi.getById(id!),
    enabled: !!id,
  });

  if (isLoading) return (
    <Layout>
      <div className="flex justify-center py-12"><Spinner size="lg" /></div>
    </Layout>
  );

  return (
    <Layout>
      <PostModal post={post ?? null} onClose={() => navigate(-1)} />
    </Layout>
  );
}
