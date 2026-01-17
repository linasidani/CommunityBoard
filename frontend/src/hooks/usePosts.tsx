import { useState, useEffect } from 'react';
import { postsApi } from '../services/api';
import type { Post, CreatePostRequest } from '../types';

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await postsApi.getAll();
      setPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (data: CreatePostRequest) => {
    setError(null);
    try {
      const newPost = await postsApi.create(data);
      setPosts((prev) => [newPost, ...prev]);
      return newPost;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
      throw err;
    }
  };

  const updatePost = async (id: number, data: CreatePostRequest) => {
    setError(null);
    try {
      const updatedPost = await postsApi.update(id, data);
      setPosts((prev) =>
        prev.map((post) => (post.id === id ? updatedPost : post))
      );
      return updatedPost;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update post');
      throw err;
    }
  };

  const deletePost = async (id: number) => {
    setError(null);
    try {
      await postsApi.delete(id);
      setPosts((prev) => prev.filter((post) => post.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post');
      throw err;
    }
  };

  const searchPosts = async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await postsApi.search(query);
      setPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search posts');
    } finally {
      setLoading(false);
    }
  };

  const filterByCategory = async (category: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await postsApi.getByCategory(category);
      setPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to filter posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return {
    posts,
    loading,
    error,
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
    searchPosts,
    filterByCategory,
  };
};