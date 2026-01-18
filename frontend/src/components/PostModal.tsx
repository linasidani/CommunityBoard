import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Post } from '../types';

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; content: string; category: string }) => Promise<void>;
  post?: Post | null;
  categories: string[];
}

export const PostModal = ({ isOpen, onClose, onSubmit, post, categories }: PostModalProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Populate form if editing
  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
      setCategory(post.category);
    } else {
      setTitle('');
      setContent('');
      setCategory(categories[0]);
    }
    setError('');
  }, [post, categories]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onSubmit({ title, content, category });
      // Reset form
      setTitle('');
      setContent('');
      setCategory(categories[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Något gick fel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          aria-label="Stäng"
        >
          <X size={24} />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
          {post ? 'Redigera inlägg' : 'Nytt inlägg'}
        </h2>

        {/* Error message */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-4" role="alert">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="post-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Titel *
            </label>
            <input
              id="post-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="Skriv en titel..."
              required
            />
          </div>

          <div>
            <label htmlFor="post-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Kategori *
            </label>
            <select
              id="post-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="post-content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Innehåll *
            </label>
            <textarea
              id="post-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="Skriv ditt inlägg här..."
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 dark:bg-blue-700 text-white py-2 rounded hover:bg-blue-700 dark:hover:bg-blue-800 transition disabled:opacity-50"
            >
              {loading ? 'Sparar...' : post ? 'Uppdatera' : 'Publicera'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-700 transition"
            >
              Avbryt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};