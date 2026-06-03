import { AppBar, Avatar, Box, Button, Container, Stack, Toolbar, Typography } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export function AppLayout() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Box className="app-shell">
      <AppBar position="sticky" color="inherit" elevation={0} className="top-bar">
        <Toolbar className="top-bar__toolbar">
          <Button component={Link} to="/dashboard" startIcon={<DashboardIcon />} color="primary">
            Kanban
          </Button>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Avatar src={user?.avatar || undefined} sx={{ width: 32, height: 32 }}>
              {user?.name?.[0]?.toUpperCase()}
            </Avatar>
            <Typography variant="body2" className="top-bar__user">
              {user?.name}
            </Typography>
            <Button onClick={handleLogout} startIcon={<LogoutIcon />} variant="outlined" size="small">
              Logout
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" className="page-container">
        <Outlet />
      </Container>
    </Box>
  );
}
