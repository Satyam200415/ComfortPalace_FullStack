import { api } from './api';

/**
 * API service for Amenity operations
 */
export const amenityApi = {
  api,

  // Get all amenities
  getAllAmenities: async () => {
    const response = await api.get('/api/amenities');
    return response.data;
  },

  // Get active amenities only
  getActiveAmenities: async () => {
    const response = await api.get('/api/amenities/active');
    return response.data;
  },

  // Get amenity by ID
  getAmenityById: async (id) => {
    const response = await api.get(`/api/amenities/${id}`);
    return response.data;
  },

  // Create new amenity (admin only)
  createAmenity: async (amenityData) => {
    const response = await api.post('/api/amenities', amenityData);
    return response.data;
  },

  // Update amenity (admin only)
  updateAmenity: async (id, amenityData) => {
    const response = await api.put(`/api/amenities/${id}`, amenityData);
    return response.data;
  },

  // Delete amenity (admin only)
  deleteAmenity: async (id) => {
    const response = await api.delete(`/api/amenities/${id}`);
    return response.data;
  },
};
