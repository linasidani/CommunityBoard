import { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { PostCard } from './PostCard';
import { PostModal } from './PostModal';
import { usePosts } from '../hooks/usePosts';
import { useAuth } from '../hooks/useAuth';
import type { Post } from '../types';

const CATEGORIES = ['Allmänt', 'Jobb', 'Boende', 'Säljes', 'Köpes', 'Evenemang', 'Övrigt'];

export const PostList = () => {
  const { posts, loading, error, createPost, updatePost, deletePost, searchPosts, filterByCategory, fetchPosts } = usePosts();
  const { isAuthenticated } = useAuth();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const handleCreatePost = async (data: { title: string; content: string; category: string }) => {
    await createPost(data);
    setIsModalOpen(false);
  };

  const handleUpdatePost = async (data: { title: string; content: string; category: string }) => {
    if (editingPost) {
      await updatePost(editingPost.id, data);
      setEditingPost(null);
      setIsModalOpen(false);
    }
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setIsModalOpen(true);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      await searchPosts(searchQuery);
    } else {
      await fetchPosts();
    }
  };

  const handleCategoryFilter = async (category: string) => {
    if (category === selectedCategory) {
      // Deselect - show all
      setSelectedCategory('');
      await fetchPosts();
    } else {
      setSelectedCategory(category);
      await filterByCategory(category);
    }
  };

  const handleClearFilters = async () => {
    setSearchQuery('');
    setSelectedCategory('');
    await fetchPosts();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with search and create button */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Sök inlägg..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Sök
            </button>
            {(searchQuery || selectedCategory) && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
              >
                Rensa
              </button>
            )}
          </form>

          {/* Create post button */}
          {isAuthenticated && (
            <button
              onClick={() => {
                setEditingPost(null);
                setIsModalOpen(true);
              }}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition flex items-center gap-2 whitespace-nowrap"
            >
              <Plus size={20} />
              Nytt inlägg
            </button>
          )}
        </div>

        {/* Category filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={18} className="text-gray-600" />
          <span className="text-sm text-gray-600">Kategorier:</span>
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryFilter(category)}
              className={`text-sm px-3 py-1 rounded transition ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Laddar inlägg...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Posts grid */}
      {!loading && !error && (
        <>
          {posts.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              <p className="text-lg">Inga inlägg hittades</p>
              {isAuthenticated && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
                >
                  Skapa första inlägget
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onEdit={handleEdit}
                  onDelete={deletePost}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Post Modal */}
      <PostModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPost(null);
        }}
        onSubmit={editingPost ? handleUpdatePost : handleCreatePost}
        post={editingPost}
        categories={CATEGORIES}
      />
    </div>
  );
};