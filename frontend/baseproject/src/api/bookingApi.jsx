import { api } from './api'
export const bookingApi = {
  create: async (bookingData) => (await api.post('/api/bookings', bookingData)).data,
  getMyBookings: async () => (await api.get('/api/bookings/me')).data,
  getOwnerHotelBookings: async (hotelId) => (await api.get(`/api/bookings/owner/hotel/${hotelId}`)).data,
  updateStatus: async (bookingId, status) => {
    try {
      const response = await api.patch(`/api/bookings/${bookingId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Failed to update booking status:', error);
      throw error;
    }
  },
}
