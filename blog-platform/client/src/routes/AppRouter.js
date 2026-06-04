import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../layouts/MainLayout';
import Loader from '../components/Loader';

// Lazy load pages for code splitting
const Home = lazy(() => import('../pages/Home'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const CreateBlog = lazy(() => import('../pages/CreateBlog'));
const EditBlog = lazy(() => import('../pages/EditBlog'));
const BlogDetails = lazy(() => import('../pages/BlogDetails'));
const Profile = lazy(() => import('../pages/Profile'));
const AuthorProfile = lazy(() => import('../pages/AuthorProfile'));
const NotFound = lazy(() => import('../pages/NotFound'));

const AppRouter = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<Loader fullScreen />}>
          <Routes>
            <Route element={<MainLayout />}>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/blogs/:id" element={<BlogDetails />} />
              <Route path="/authors/:id" element={<AuthorProfile />} />

              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
              />
              <Route
                path="/blogs/create"
                element={<ProtectedRoute><CreateBlog /></ProtectedRoute>}
              />
              <Route
                path="/blogs/:id/edit"
                element={<ProtectedRoute><EditBlog /></ProtectedRoute>}
              />
              <Route
                path="/profile"
                element={<ProtectedRoute><Profile /></ProtectedRoute>}
              />

              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRouter;
