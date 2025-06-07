import api from './api';

export interface LecturerSelection {
  id: number;
  lecturer: {
    id: number;
    email: string;
    role: string;
  };
  application: {
    id: number;
    fullName: string;
    user: {
      id: number;
      email: string;
    };
    course: {
      id: number;
      code: string;
      title: string;
    };
  };
  rank: number;
  comments: string;
  selectedAt: string;
  updatedAt: string;
}

export interface CreateSelectionRequest {
  lecturerId: number;
  applicationId: number;
  rank: number;
  comments?: string;
}

export interface UpdateSelectionRequest {
  rank?: number;
  comments?: string;
}

export interface ReorderSelectionsRequest {
  lecturerId: number;
  selections: Array<{
    selectionId: number;
    newRank: number;
  }>;
}

export const lecturerSelectionService = {
  // Get all selections with optional filtering
  async getAllSelections(filters?: {
    lecturerId?: number;
    applicationId?: number;
  }): Promise<LecturerSelection[]> {
    const params = new URLSearchParams();
    if (filters?.lecturerId) params.append('lecturerId', filters.lecturerId.toString());
    if (filters?.applicationId) params.append('applicationId', filters.applicationId.toString());

    const response = await api.get(`/lecturer-selections?${params.toString()}`);
    return response.data;
  },

  // Get selections by lecturer
  async getSelectionsByLecturer(lecturerId: number): Promise<LecturerSelection[]> {
    const response = await api.get(`/lecturer-selections/lecturer/${lecturerId}`);
    return response.data;
  },

  // Create new selection
  async createSelection(data: CreateSelectionRequest): Promise<LecturerSelection> {
    const response = await api.post('/lecturer-selections', data);
    return response.data;
  },

  // Update selection
  async updateSelection(id: number, data: UpdateSelectionRequest): Promise<LecturerSelection> {
    const response = await api.put(`/lecturer-selections/${id}`, data);
    return response.data;
  },

  // Delete selection
  async deleteSelection(id: number): Promise<void> {
    await api.delete(`/lecturer-selections/${id}`);
  },

  // Delete selection by lecturer and application IDs
  async deleteSelectionByIds(lecturerId: number, applicationId: number): Promise<void> {
    await api.delete(`/lecturer-selections/lecturer/${lecturerId}/application/${applicationId}`);
  },

  // Reorder selections for a lecturer
  async reorderSelections(data: ReorderSelectionsRequest): Promise<LecturerSelection[]> {
    const response = await api.post('/lecturer-selections/reorder', data);
    return response.data;
  }
};