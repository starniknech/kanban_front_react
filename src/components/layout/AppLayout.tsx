import { AppBar, Avatar, Box, Button, Container, IconButton, Stack, Toolbar, Tooltip, Typography } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { getAssetUrl } from '../../utils/assets';

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
            <Box className="top-bar__user">
              <Typography variant="body2" className="top-bar__user-name">
                {user?.name}
              </Typography>
              <Typography variant="caption" className="top-bar__user-email">
                {user?.email}
              </Typography>
            </Box>
            <Avatar src={getAssetUrl(user?.avatar)} sx={{ width: 32, height: 32 }}>
              {user?.name?.[0]?.toUpperCase()}
            </Avatar>
            <Tooltip title="User settings">
              <IconButton className="top-bar__settings-button" component={Link} to="/user-settings" size="small" color="primary">
                <SettingsIcon fontSize="small" />
              </IconButton>
            </Tooltip>
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
