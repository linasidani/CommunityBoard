export interface User {
  id: number;
  username: string;
  email: string;
  role: 'Admin' | 'User';
}

export interface Post {
  id: number;
  title: string;
  content: string;
  category: string;
  userId: number;
  username: string;
  createdAt: string;
  imageUrl?: string;
  commentCount: number;
}

export interface Comment {
  id: number;
  postId: number;
  userId: number;
  username: string;
  content: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  category: string;
}

export interface CreateCommentRequest {
  content: string;
}