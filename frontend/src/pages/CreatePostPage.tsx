import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ImagePlus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { postsApi } from '../api/posts';
import Layout from '../components/layout/Layout';
import Spinner from '../components/ui/Spinner';

export default function CreatePostPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const handleFile = (f: File) => {
    if (!f.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const createMut = useMutation({
    mutationFn: () => postsApi.create({
      file: file!,
      caption,
      tags: tagsInput.split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['feed'] });
      qc.invalidateQueries({ queryKey: ['discover'] });
      toast.success('Post shared!');
      navigate('/');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create post');
    },
  });

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-6 px-4">
        <h1 className="text-lg font-semibold mb-6">Create new post</h1>

        {!preview ? (
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full border-2 border-dashed border-gray-300 rounded-2xl p-16 flex flex-col items-center gap-3 hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            <ImagePlus size={48} className="text-gray-400" />
            <p className="text-gray-500 font-medium">Click to select a photo</p>
            <p className="text-gray-400 text-sm">JPEG, PNG, WebP supported</p>
          </button>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <img src={preview} alt="Preview" className="w-full max-h-96 object-cover rounded-xl" />
              <button
                onClick={() => { setFile(null); setPreview(null); }}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70"
              >
                <X size={16} />
              </button>
            </div>

            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption..."
              maxLength={2200}
              rows={3}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-gray-500"
            />

            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Tags (comma separated, e.g. nature, travel)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gray-500"
            />

            <button
              onClick={() => createMut.mutate()}
              disabled={createMut.isPending}
              className="w-full bg-blue-500 text-white font-semibold py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {createMut.isPending ? <><Spinner size="sm" /> Sharing...</> : 'Share'}
            </button>
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </div>
    </Layout>
  );
}
