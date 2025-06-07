import api from './api';

export interface User {
  id: number;
  email: string;
  role: 'candidate' | 'lecturer' | 'admin';
  createdAt: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  role: 'candidate' | 'lecturer' | 'admin';
}

export interface UpdateUserRequest {
  email?: string;
  password?: string;
  role?: 'candidate' | 'lecturer' | 'admin';
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignInResponse {
  user: User;
}

export const userService = {
  // Get all users
  async getAllUsers(): Promise<User[]> {
    const response = await api.get('/users');
    return response.data.map((user: any) => ({
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    }));
  },

  // Get user by ID
  async getUserById(id: number): Promise<User> {
    const response = await api.get(`/users/${id}`);
    return {
      id: response.data.id,
      email: response.data.email,
      role: response.data.role,
      createdAt: response.data.createdAt
    };
  },

  // Create new user (register)
  async createUser(data: CreateUserRequest): Promise<User> {
    const response = await api.post('/users', data);
    return {
      id: response.data.id,
      email: response.data.email,
      role: response.data.role,
      createdAt: response.data.createdAt
    };
  },

  // Update user
  async updateUser(id: number, data: UpdateUserRequest): Promise<User> {
    const response = await api.put(`/users/${id}`, data);
    return {
      id: response.data.id,
      email: response.data.email,
      role: response.data.role,
      createdAt: response.data.createdAt
    };
  },

  // Delete user
  async deleteUser(id: number): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  // Sign in
  async signIn(data: SignInRequest): Promise<SignInResponse> {
    const response = await api.post('/auth/signin', data);
    return response.data;
  },

  // Get current user profile by email
  async getCurrentUser(email: string): Promise<User> {
    const response = await api.get(`/auth/profile/${email}`);
    return {
      id: response.data.id,
      email: response.data.email,
      role: response.data.role,
      createdAt: response.data.createdAt
    };
  }
};