import { createContext, useEffect, useState } from "react";
import { api } from '../api/api'

export const LoginContext = createContext();

export const LoginProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedUserRaw = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    const storedUser = storedUserRaw ? JSON.parse(storedUserRaw) : null
    const validToken = storedToken && storedToken !== 'undefined' && storedToken !== 'null'

    if (storedUser && validToken) {
      setUser(storedUser)
      setToken(storedToken)
      setIsAuthenticated(true)
      api.get('/auth/me').then((response) => {
        localStorage.setItem('user', JSON.stringify(response.data))
        setUser(response.data)
      }).catch(() => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null); setToken(null); setIsAuthenticated(false)
      })
    } else {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }, []);

  const login = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    setToken(token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    setToken(null);
  };

  return (
    <LoginContext.Provider
      value={{ login, logout, user, token, isAuthenticated }}
    >
      {children}
    </LoginContext.Provider>
  );
};
