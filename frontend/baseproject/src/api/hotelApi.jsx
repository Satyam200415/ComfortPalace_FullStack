import { api } from './api';

export const resolveHotelImageUrl = (value, fallback = '') => {
  if (!value || typeof value !== 'string') return fallback;

  const trimmedValue = value.trim();
  if (!trimmedValue) return fallback;

  if (trimmedValue.startsWith('http://') || trimmedValue.startsWith('https://') || trimmedValue.startsWith('data:')) {
    return trimmedValue;
  }

  const baseUrl = (api.defaults.baseURL || '').replace(/\/$/, '');
  if (trimmedValue.startsWith('/')) {
    return `${baseUrl}${trimmedValue}`;
  }

  if (trimmedValue.startsWith('uploads/') || trimmedValue.startsWith('images/')) {
    return `${baseUrl}/${trimmedValue}`;
  }

  return `${baseUrl}/${trimmedValue}`;
};

export const getHotelImageUrl = (value, fallback = '') => {
  const resolvedUrl = resolveHotelImageUrl(value, fallback);
  if (!resolvedUrl) return resolvedUrl;

  const token = localStorage.getItem('token');
  if (!token) return resolvedUrl;

  const isLocalBackendUrl = resolvedUrl.startsWith(api.defaults.baseURL || '');
  if (!isLocalBackendUrl) return resolvedUrl;

  const separator = resolvedUrl.includes('?') ? '&' : '?';
  return `${resolvedUrl}${separator}token=${encodeURIComponent(token)}`;
};

export const hotelApi = {
  api,

  // Get hotel by ID
  getHotelById: async (id) => {
    const response = await api.get(`/api/hotels/${id}`);
    return response.data;
  },

  // Get hotel by slug
  getHotelBySlug: async (slug) => {
    const response = await api.get(`/api/hotels/slug/${slug}`);
    return response.data;
  },

  // Get hotels by owner (owner only)
  getMyHotels: async () => {
    const response = await api.get('/api/hotels/owner');
    return response.data?.data || response.data;
  },

  // Get hotels by owner (paginated)
  getHotelsByOwnerPaginated: async (params = {}) => {
    const response = await api.get('/api/hotels/owner/paginated', { params });
    return response.data?.data || response.data;
  },

  // Get hotels by city
  getHotelsByCity: async (city) => {
    const response = await api.get(`/api/hotels/city/${city}`);
    return response.data;
  },

  // Get hotels by city (paginated)
  getHotelsByCityPaginated: async (city, params = {}) => {
    const response = await api.get(`/api/hotels/city/${city}/paginated`, { params });
    return response.data;
  },

  // Get published hotels by city
  getPublishedHotelsByCity: async (city) => {
    const response = await api.get(`/api/hotels/city/${city}/published`);
    return response.data;
  },

  // Get published hotels by city (paginated)
  getPublishedHotelsByCityPaginated: async (city, params = {}) => {
    const response = await api.get(`/api/hotels/city/${city}/published/paginated`, { params });
    return response.data;
  },

  // Search hotels
  searchHotels: async (keyword, params = {}) => {
    const response = await api.get('/api/hotels/search', { params: { keyword, ...params } });
    return response.data;
  },

  // Add a new hotel (owner only)
  addHotel: async (hotelData) => {
    const response = await api.post('/api/hotels', hotelData);
    return response.data?.data || response.data;
  },

  // Update an existing hotel (owner only)
  updateHotel: async (id, hotelData) => {
    const response = await api.put(`/api/hotels/${id}`, hotelData);
    return response.data?.data || response.data;
  },

  // Delete a hotel (owner only)
  deleteHotel: async (id) => {
    const response = await api.delete(`/api/hotels/${id}`);
    return response.data;
  },

  // Get hotel statistics (owner only)
  getHotelStats: async () => {
    const response = await api.get('/api/hotels/owner/stats');
    return response.data?.data || response.data;
  },

  // Get owner bookings (owner only)
  getOwnerBookings: async () => {
    const response = await api.get('/api/bookings/owner');
    return response.data;
  },

  // Get bookings for a specific hotel (owner only)
  getHotelBookings: async (hotelId) => {
    const response = await api.get(`/api/bookings/owner/hotel/${hotelId}`);
    return response.data;
  },

  // Upload hotel image (owner only)
  uploadImage: async (id, file) => {
    const formData = new FormData();
    formData.append('hotelImage', file);
    const response = await api.post(`/api/hotels/${id}/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get hotel image
  getHotelImage: (id) => {
    const token = localStorage.getItem('token');
    const url = `${api.defaults.baseURL}/api/hotels/${id}/image`;
    return token ? `${url}?token=${token}` : url;
  },
};
