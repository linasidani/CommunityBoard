import { useState, useEffect } from 'react';
import { X, Calendar, MessageCircle, Send, Trash2 } from 'lucide-react';
import { useComments } from '../hooks/useComments';
import { useAuth } from '../hooks/useAuth';
import type { Post } from '../types';

interface PostDetailProps {
  post: Post;
  onClose: () => void;
}

export const PostDetail = ({ post, onClose }: PostDetailProps) => {
  const { comments, loading, error, fetchComments, createComment, deleteComment } = useComments(post.id);
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      await createComment({ content: newComment });
      setNewComment('');
    } catch (err) {
      console.error('Failed to create comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (window.confirm('Är du säker på att du vill ta bort denna kommentar?')) {
      await deleteComment(commentId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="p-6 border-b dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                {post.title}
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">{post.username}</span>
                <span className="flex items-center gap-1">
                  <Calendar size={14} aria-hidden="true" />
                  {formatDate(post.createdAt)}
                </span>
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-3 py-1 rounded-full">
                  {post.category}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-2"
              aria-label="Stäng"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Post Content */}
        <div className="p-6 border-b dark:border-gray-700">
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {post.content}
          </p>
        </div>

        {/* Comments Section */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle size={20} className="text-gray-600 dark:text-gray-400" aria-hidden="true" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Kommentarer ({comments.length})
            </h3>
          </div>

          {/* Comments List */}
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400" aria-hidden="true"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Laddar kommentarer...</p>
            </div>
          ) : error ? (
            <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded" role="alert">
              {error}
            </div>
          ) : comments.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">
              Inga kommentarer än. Bli först att kommentera!
            </p>
          ) : (
            <div className="space-y-4 mb-6">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800 dark:text-white">
                        {comment.username}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    {(user?.id === comment.userId || isAdmin) && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1"
                        aria-label="Ta bort kommentar"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Add Comment Form */}
          {isAuthenticated ? (
            <form onSubmit={handleSubmitComment} className="mt-6">
              <label htmlFor="new-comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Skriv en kommentar
              </label>
              <div className="flex gap-2">
                <textarea
                  id="new-comment"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Dela dina tankar..."
                  required
                />
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="self-end bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-700 dark:hover:bg-blue-800 transition disabled:opacity-50 flex items-center gap-2"
                  aria-label="Skicka kommentar"
                >
                  <Send size={18} aria-hidden="true" />
                  Skicka
                </button>
              </div>
            </form>
          ) : (
            <p className="text-center text-gray-600 dark:text-gray-400 py-4">
              Du måste vara inloggad för att kommentera
            </p>
          )}
        </div>
      </div>
    </div>
  );
};