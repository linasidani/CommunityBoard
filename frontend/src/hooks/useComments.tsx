import { useState } from 'react';
import { commentsApi } from '../services/api';
import type { Comment, CreateCommentRequest } from '../types';

export const useComments = (postId: number) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await commentsApi.getByPostId(postId);
      setComments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch comments');
    } finally {
      setLoading(false);
    }
  };

  const createComment = async (data: CreateCommentRequest) => {
    setError(null);
    try {
      const newComment = await commentsApi.create(postId, data);
      setComments((prev) => [...prev, newComment]);
      return newComment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create comment');
      throw err;
    }
  };

  const deleteComment = async (commentId: number) => {
    setError(null);
    try {
      await commentsApi.delete(postId, commentId);
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete comment');
      throw err;
    }
  };

  return {
    comments,
    loading,
    error,
    fetchComments,
    createComment,
    deleteComment,
  };
};