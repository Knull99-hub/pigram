import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/auth.store';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({
    email: '',
    username: '',
    displayName: '',
    password: '',
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const registerMut = useMutation({
    mutationFn: () => authApi.register(form),
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      navigate('/');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Registration failed');
    },
  });

  const valid = form.email && form.username && form.displayName && form.password.length >= 6;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4">
        <div className="bg-white border border-gray-200 rounded-lg p-8 space-y-4">
          <h1 className="text-center text-3xl font-bold tracking-tight">Pixgram</h1>
          <p className="text-center text-gray-500 text-sm">Sign up to see photos from friends.</p>

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={set('email')}
            className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:border-gray-500"
          />
          <input
            placeholder="Username"
            value={form.username}
            onChange={set('username')}
            className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:border-gray-500"
          />
          <input
            placeholder="Display Name"
            value={form.displayName}
            onChange={set('displayName')}
            className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:border-gray-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={set('password')}
            className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:border-gray-500"
          />

          <button
            onClick={() => registerMut.mutate()}
            disabled={!valid || registerMut.isPending}
            className="w-full bg-blue-500 text-white font-semibold py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {registerMut.isPending ? 'Creating account...' : 'Sign up'}
          </button>

          <p className="text-xs text-gray-400 text-center leading-relaxed">
            By signing up, you agree to our Terms and Privacy Policy.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center text-sm">
          Have an account?{' '}
          <Link to="/login" className="text-blue-500 font-semibold hover:text-blue-600">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
