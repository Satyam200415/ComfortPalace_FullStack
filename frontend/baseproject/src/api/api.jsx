import axios from "axios";

export const api = axios.create({
    baseURL: "http://localhost:8080",
})
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const url = config.url || ''
    const baseUrl = (api.defaults.baseURL || '').replace(/\/$/, '')
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`
    const requestPath = new URL(fullUrl).pathname
    const authPaths = ['/auth/login', '/auth/register', '/users']
    const isAuthRoute = authPaths.some((path) => requestPath.startsWith(path))

    if (token && !isAuthRoute) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);