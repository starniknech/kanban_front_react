import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { LoginPayload } from '../services/AuthService';
import { useAuthStore } from '../store/authStore';

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const { register, handleSubmit, formState } = useForm<LoginPayload>();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = handleSubmit(async (payload) => {
    setError(null);
    try {
      await login(payload);
      navigate('/dashboard');
    } catch {
      setError('Invalid email or password.');
    }
  });

  return (
    <Box className="auth-page">
      <Paper className="auth-panel" variant="outlined">
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="h1">Login</Typography>
            <Typography color="text.secondary">Enter your account to manage projects.</Typography>
          </Box>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Email" autoComplete="email" {...register('email', { required: true })} />
          <TextField label="Password" type="password" autoComplete="current-password" {...register('password', { required: true, minLength: 6 })} />
          <Button variant="contained" onClick={onSubmit} disabled={formState.isSubmitting}>Login</Button>
          <Button component={Link} to="/registration">Create account</Button>
        </Stack>
      </Paper>
    </Box>
  );
}
