import { CssBaseline, ThemeProvider } from '@mui/material';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { ProtectedRoute } from '../components/routing/ProtectedRoute';
import { PublicRoute } from '../components/routing/PublicRoute';
import { useAuthStore } from '../store/authStore';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { ProjectPage } from '../pages/ProjectPage';
import { ProjectTasksPage } from '../pages/ProjectTasksPage';
import { RegisterPage } from '../pages/RegisterPage';
import { TaskDetailsPage } from '../pages/TaskDetailsPage';
import { theme } from './theme';

export default function App() {
  const bootstrap = useAuthStore((state) => state.bootstrap);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registration" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/project/:projectId" element={<ProjectPage />} />
            <Route path="/project/:projectId/tasks" element={<ProjectTasksPage />} />
            <Route path="/project/:projectId/tasks/:taskId" element={<TaskDetailsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </ThemeProvider>
  );
}
