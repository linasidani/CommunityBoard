import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  Post,
  CreatePostRequest,
  Comment,
  CreateCommentRequest,
} from '../types';

const API_BASE_URL = 'http://localhost:5160/api';

// Helper function för att hantera responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Something went wrong');
  }
  return response.json();
}

// Helper function för att få token
function getAuthHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ============ AUTH ============
export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<AuthResponse>(response);
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<AuthResponse>(response);
  },
};

// ============ POSTS ============
export const postsApi = {
  getAll: async (): Promise<Post[]> => {
    const response = await fetch(`${API_BASE_URL}/posts`);
    return handleResponse<Post[]>(response);
  },

  getById: async (id: number): Promise<Post> => {
    const response = await fetch(`${API_BASE_URL}/posts/${id}`);
    return handleResponse<Post>(response);
  },

  create: async (data: CreatePostRequest): Promise<Post> => {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse<Post>(response);
  },

  update: async (id: number, data: CreatePostRequest): Promise<Post> => {
    const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse<Post>(response);
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    if (!response.ok) {
      throw new Error('Failed to delete post');
    }
  },

  search: async (query: string): Promise<Post[]> => {
    // Filtrera på frontend för att undvika backend routing-konflikt
    const allPosts = await postsApi.getAll();
    const lowerQuery = query.toLowerCase();
    return allPosts.filter(post => 
      post.title.toLowerCase().includes(lowerQuery) ||
      post.content.toLowerCase().includes(lowerQuery)
    );
  },

  getByCategory: async (category: string): Promise<Post[]> => {
    // Filtrera på frontend för att undvika backend routing-konflikt
    const allPosts = await postsApi.getAll();
    return allPosts.filter(post => post.category === category);
  },
};

// ============ COMMENTS ============
export const commentsApi = {
  getByPostId: async (postId: number): Promise<Comment[]> => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`);
    return handleResponse<Comment[]>(response);
  },

  create: async (
    postId: number,
    data: CreateCommentRequest
  ): Promise<Comment> => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse<Comment>(response);
  },

  delete: async (postId: number, commentId: number): Promise<void> => {
    const response = await fetch(
      `${API_BASE_URL}/posts/${postId}/comments/${commentId}`,
      {
        method: 'DELETE',
        headers: getAuthHeader(),
      }
    );
    if (!response.ok) {
      throw new Error('Failed to delete comment');
    }
  },
};