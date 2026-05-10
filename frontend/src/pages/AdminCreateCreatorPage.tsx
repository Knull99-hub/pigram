import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import client from '../api/client';

export default function AdminCreateCreatorPage() {
  const [adminKey, setAdminKey] = useState('');
  const [form, setForm] = useState({ email: '', username: '', displayName: '', password: '' });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const mut = useMutation({
    mutationFn: () =>
      client.post('/auth/admin/create-creator', form, { headers: { 'x-admin-key': adminKey } }).then((r) => r.data),
    onSuccess: (data: any) => toast.success(`Creator account created: @${data.user.username}`),
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const valid = adminKey && form.email && form.username && form.displayName && form.password.length >= 8;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white border border-gray-200 rounded-lg p-8 w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold text-center">Admin — Create Creator</h1>
        <p className="text-xs text-gray-400 text-center">This page is not publicly linked. Creators are enrolled by admins only.</p>

        <input
          type="password"
          placeholder="Admin Key"
          value={adminKey}
          onChange={(e) => setAdminKey(e.target.value)}
          className="w-full border border-red-300 rounded-md px-3 py-2.5 text-sm bg-red-50 focus:outline-none"
        />
        <hr />
        <input placeholder="Email" type="email" value={form.email} onChange={set('email')}
          className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm bg-gray-50 focus:outline-none" />
        <input placeholder="Username" value={form.username} onChange={set('username')}
          className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm bg-gray-50 focus:outline-none" />
        <input placeholder="Display Name" value={form.displayName} onChange={set('displayName')}
          className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm bg-gray-50 focus:outline-none" />
        <input placeholder="Password (min 8 chars)" type="password" value={form.password} onChange={set('password')}
          className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm bg-gray-50 focus:outline-none" />

        <button
          onClick={() => mut.mutate()}
          disabled={!valid || mut.isPending}
          className="w-full bg-gray-900 text-white font-semibold py-2 rounded-lg text-sm hover:bg-gray-700 disabled:opacity-50"
        >
          {mut.isPending ? 'Creating...' : 'Create Creator Account'}
        </button>
      </div>
    </div>
  );
}
