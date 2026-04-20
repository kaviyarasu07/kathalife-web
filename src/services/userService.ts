import axios from 'axios';
import api from './api';
import {
  ApiResponse,
  UserResponse,
  BioProfileRequest,
  BioProfileResponse,
  LifeSummaryRequest,
  LifeSummaryResponse,
  LanguageResponse,
} from '@/types';

function parseAxiosError(err: unknown): Error {
  if (axios.isAxiosError(err)) {
    const msg = (err.response as any)?.data?.message || err.message;
    return new Error(String(msg));
  }
  return new Error('An unexpected error occurred');
}

export const userService = {
  getCurrentUser: async (): Promise<UserResponse> => {
    try {
      const response = await api.get<ApiResponse<UserResponse>>('/v1/users/me');
      return response.data.data;
    } catch (err) {
      throw parseAxiosError(err);
    }
  },

  getBioProfile: async (): Promise<BioProfileResponse> => {
    try {
      const response = await api.get<ApiResponse<BioProfileResponse>>('/v1/users/me/bio');
      return response.data.data;
    } catch (err) {
      throw parseAxiosError(err);
    }
  },

  updateBioProfile: async (data: BioProfileRequest): Promise<BioProfileResponse> => {
    try {
      const response = await api.put<ApiResponse<BioProfileResponse>>('/v1/users/me/bio', data);
      return response.data.data;
    } catch (err) {
      throw parseAxiosError(err);
    }
  },

  getLifeSummary: async (): Promise<LifeSummaryResponse> => {
    try {
      const response = await api.get<ApiResponse<LifeSummaryResponse>>('/v1/users/me/life-summary');
      return response.data.data;
    } catch (err) {
      throw parseAxiosError(err);
    }
  },

  updateLifeSummary: async (data: LifeSummaryRequest): Promise<LifeSummaryResponse> => {
    try {
      const response = await api.put<ApiResponse<LifeSummaryResponse>>('/v1/users/me/life-summary', data);
      return response.data.data;
    } catch (err) {
      throw parseAxiosError(err);
    }
  },

  getLanguages: async (): Promise<LanguageResponse[]> => {
    try {
      const response = await api.get<ApiResponse<LanguageResponse[]>>('/v1/languages');
      return response.data.data;
    } catch (err) {
      throw parseAxiosError(err);
    }
  },
};
