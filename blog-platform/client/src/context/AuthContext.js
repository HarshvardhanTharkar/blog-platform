import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import authService from '../services/authService';

// ─── State shape ─────────────────────────────────────────────────────────────
const initialState = {
  user: authService.getStoredUser(),
  token: authService.getToken(),
  isAuthenticated: authService.isAuthenticated(),
  loading: false,
  error: null,
};

// ─── Reducer ──────────────────────────────────────────────────────────────────
const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, loading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };
    case 'AUTH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'LOGOUT':
      return { ...initialState, user: null, token: null, isAuthenticated: false };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Validate token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (state.token) {
        try {
          const user = await authService.getCurrentUser();
          dispatch({ type: 'AUTH_SUCCESS', payload: { user, token: state.token } });
        } catch {
          dispatch({ type: 'LOGOUT' });
        }
      }
    };
    verifyToken();
  }, []); // eslint-disable-line

  const register = useCallback(async (name, email, password) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const { token, user } = await authService.register(name, email, password);
      dispatch({ type: 'AUTH_SUCCESS', payload: { token, user } });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'AUTH_ERROR', payload: message });
      return { success: false, message };
    }
  }, []);

  const login = useCallback(async (email, password) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const { token, user } = await authService.login(email, password);
      dispatch({ type: 'AUTH_SUCCESS', payload: { token, user } });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'AUTH_ERROR', payload: message });
      return { success: false, message };
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    dispatch({ type: 'LOGOUT' });
  }, []);

  const updateUser = useCallback((updates) => {
    dispatch({ type: 'UPDATE_USER', payload: updates });
    // Sync to localStorage
    const stored = authService.getStoredUser();
    if (stored) {
      localStorage.setItem('user', JSON.stringify({ ...stored, ...updates }));
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        register,
        login,
        logout,
        updateUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
