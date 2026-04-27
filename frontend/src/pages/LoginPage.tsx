import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/auth.store';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loginMut = useMutation({
    mutationFn: () => authApi.login({ email, password }),
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      navigate('/');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Login failed');
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4">
        <div className="bg-white border border-gray-200 rounded-lg p-8 space-y-4">
          <h1 className="text-center text-3xl font-bold tracking-tight mb-6">Pixgram</h1>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:border-gray-500 transition-colors"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loginMut.mutate()}
            className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:border-gray-500 transition-colors"
          />

          <button
            onClick={() => loginMut.mutate()}
            disabled={!email || !password || loginMut.isPending}
            className="w-full bg-blue-500 text-white font-semibold py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loginMut.isPending ? 'Logging in...' : 'Log in'}
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-500 font-semibold hover:text-blue-600">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
