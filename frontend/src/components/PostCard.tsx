import { MessageCircle, Edit, Trash2, Calendar } from 'lucide-react';
import type { Post } from '../types';
import { useAuth } from '../hooks/useAuth';

interface PostCardProps {
  post: Post;
  onEdit?: (post: Post) => void;
  onDelete?: (id: number) => void;
  onClick?: () => void;
}

export const PostCard = ({ post, onEdit, onDelete, onClick }: PostCardProps) => {
  const { user, isAdmin } = useAuth();
  const canEdit = user?.id === post.userId || isAdmin;

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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 
            className="text-xl font-bold text-gray-800 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
            onClick={onClick}
          >
            {post.title}
          </h3>
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
            <span className="font-medium">{post.username}</span>
            <span className="flex items-center gap-1">
              <Calendar size={14} aria-hidden="true" />
              {formatDate(post.createdAt)}
            </span>
          </div>
        </div>

        {/* Category badge */}
        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-3 py-1 rounded-full">
          {post.category}
        </span>
      </div>

      {/* Content preview */}
      <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">{post.content}</p>

      {/* Footer */}
      <div className="flex justify-between items-center pt-3 border-t dark:border-gray-700">
        {/* Comment count */}
        <button
          onClick={onClick}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
        >
          <MessageCircle size={18} aria-hidden="true" />
          <span className="text-sm">{post.commentCount} kommentarer</span>
        </button>

        {/* Action buttons */}
        {canEdit && (
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(post);
                }}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-2 hover:bg-blue-50 dark:hover:bg-gray-700 rounded transition"
                aria-label="Redigera"
              >
                <Edit size={18} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('Är du säker på att du vill ta bort detta inlägg?')) {
                    onDelete(post.id);
                  }
                }}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-2 hover:bg-red-50 dark:hover:bg-gray-700 rounded transition"
                aria-label="Ta bort"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};