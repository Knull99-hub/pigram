import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Camera } from 'lucide-react';
import { usersApi } from '../api/users';
import { useAuthStore } from '../store/auth.store';
import Layout from '../components/layout/Layout';
import Avatar from '../components/ui/Avatar';
import Spinner from '../components/ui/Spinner';

export default function EditProfilePage() {
  const { user, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    displayName: user?.displayName || '',
    bio: user?.bio || '',
    website: user?.website || '',
    location: user?.location || '',
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const updateMut = useMutation({
    mutationFn: () => usersApi.updateProfile(form),
    onSuccess: (updated) => {
      updateUser(updated as any);
      qc.invalidateQueries({ queryKey: ['profile', user?.username] });
      toast.success('Profile updated');
      navigate(`/profile/${user?.username}`);
    },
    onError: () => toast.error('Failed to update profile'),
  });

  const avatarMut = useMutation({
    mutationFn: (file: File) => usersApi.updateAvatar(file),
    onSuccess: (updated) => {
      updateUser(updated as any);
      toast.success('Avatar updated');
    },
    onError: () => toast.error('Failed to update avatar'),
  });

  return (
    <Layout>
      <div className="max-w-xl mx-auto py-8 px-4">
        <h1 className="text-xl font-semibold mb-6">Edit Profile</h1>

        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <Avatar src={user?.avatarUrl} alt={user?.username} size="xl" />
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
            >
              <Camera size={20} className="text-white" />
            </button>
          </div>
          <div>
            <p className="font-semibold">{user?.username}</p>
            <button
              onClick={() => fileRef.current?.click()}
              className="text-sm text-blue-500 font-semibold hover:text-blue-600"
            >
              Change photo
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold block mb-1">Display Name</label>
            <input
              value={form.displayName}
              onChange={set('displayName')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
            />
          </div>

          <div>
            <label className="text-sm font-semibold block mb-1">Bio</label>
            <textarea
              value={form.bio}
              onChange={set('bio')}
              rows={3}
              maxLength={150}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-gray-500"
            />
            <p className="text-xs text-gray-400 text-right">{form.bio.length}/150</p>
          </div>

          <div>
            <label className="text-sm font-semibold block mb-1">Website</label>
            <input
              value={form.website}
              onChange={set('website')}
              placeholder="https://..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
            />
          </div>

          <div>
            <label className="text-sm font-semibold block mb-1">Location</label>
            <input
              value={form.location}
              onChange={set('location')}
              placeholder="City, Country"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
            />
          </div>

          <button
            onClick={() => updateMut.mutate()}
            disabled={updateMut.isPending}
            className="w-full bg-blue-500 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {updateMut.isPending ? <><Spinner size="sm" /> Saving...</> : 'Save changes'}
          </button>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && avatarMut.mutate(e.target.files[0])}
        />
      </div>
    </Layout>
  );
}
