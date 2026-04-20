import axios from 'axios';
import api from './api';
import {
  ApiResponse,
  AuthResponse,
  SignupRequest,
  LoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from '@/types';

function parseAxiosError(err: unknown): Error {
  if (axios.isAxiosError(err)) {
    const msg = (err.response as any)?.data?.message || err.message;
    return new Error(String(msg));
  }
  return new Error('An unexpected error occurred');
}

export const authService = {
  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>('/v1/auth/signup', data);
      return response.data.data;
    } catch (err) {
      throw parseAxiosError(err);
    }
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>('/v1/auth/login', data);
      return response.data.data;
    } catch (err) {
      throw parseAxiosError(err);
    }
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
    try {
      await api.post('/v1/auth/forgot-password', data);
    } catch (err) {
      throw parseAxiosError(err);
    }
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    try {
      await api.post('/v1/auth/reset-password', data);
    } catch (err) {
      throw parseAxiosError(err);
    }
  },

  logout: (): void => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    localStorage.removeItem('bioCompleted');
  },
};
