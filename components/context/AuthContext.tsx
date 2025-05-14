import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { parseCookies, destroyCookie } from 'nookies';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any; // Replace with your user type
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null); // Replace with your user type

  const logout = () => {
    // Clear authentication logic
    destroyCookie(null, 'token');
    setIsAuthenticated(false);
    setUser(null);
  };

  // Check if the user is authenticated based on cookies or other logic
  useEffect(() => {
    const cookies = parseCookies();
    const token = cookies.token;

    if (token) {
      // Fetch user info from API
      fetch('/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
        .then(response => response.json())
        .then(data => {
          setUser(data);
          setIsAuthenticated(true);
        })
        .catch(() => {
          setIsAuthenticated(false);
        });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
