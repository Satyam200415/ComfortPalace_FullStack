import { api } from './api'

export const roomApi = {
  createRoom: async (roomData,hotelId) => {
    const response = await api.post(`/api/rooms/${hotelId}`, roomData)
    return response.data
  },

  getRoomsByHotel: async (hotelId) => {
    const response = await api.get(`/api/rooms/hotel/${hotelId}`)
    return response.data
  },

  updateRoom: async (roomId, roomData) => {
    const response = await api.put(`/api/rooms/${roomId}`, roomData)
    return response.data
  },

  deleteRoom: async (roomId) => {
    await api.delete(`/api/rooms/${roomId}`)
  },

  uploadImages: async (roomId, files) => {
    const formData = new FormData()
    Array.from(files).forEach((file) => formData.append('images', file))
    const response = await api.post(`/api/rooms/${roomId}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    return response.data
  },

  getImageUrl: (image) => {
    if (image?.imageUrl?.startsWith('http://') || image?.imageUrl?.startsWith('https://')) return image.imageUrl
    return `${api.defaults.baseURL}/api/rooms/images/${image.id}`
  },

  getRoomImage: (image) => {
    const token = localStorage.getItem('token');
    const url = `${api.defaults.baseURL}/api/rooms/images/${image.id}`;
    return token ? `${url}?token=${token}` : url;
  },

  checkAvailability: async (roomId, checkIn, checkOut) => {
    const response = await api.get(`/api/rooms/${roomId}/availability`, {
      params: { checkIn, checkOut }
    });
    return response.data;
  },
}
