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
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 
            className="text-xl font-bold text-gray-800 cursor-pointer hover:text-blue-600"
            onClick={onClick}
          >
            {post.title}
          </h3>
          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
            <span className="font-medium">{post.username}</span>
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {formatDate(post.createdAt)}
            </span>
          </div>
        </div>

        {/* Category badge */}
        <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
          {post.category}
        </span>
      </div>

      {/* Content preview */}
      <p className="text-gray-700 mb-4 line-clamp-3">{post.content}</p>

      {/* Footer */}
      <div className="flex justify-between items-center pt-3 border-t">
        {/* Comment count */}
        <div className="flex items-center gap-2 text-gray-600">
          <MessageCircle size={18} />
          <span className="text-sm">{post.commentCount} kommentarer</span>
        </div>

        {/* Action buttons */}
        {canEdit && (
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(post);
                }}
                className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded transition"
                title="Redigera"
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
                className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded transition"
                title="Ta bort"
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