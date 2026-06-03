import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { RegisterPayload } from '../services/AuthService';
import { useAuthStore } from '../store/authStore';

export function RegisterPage() {
  const navigate = useNavigate();
  const registerUser = useAuthStore((state) => state.register);
  const { register, handleSubmit, formState } = useForm<RegisterPayload>();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = handleSubmit(async (payload) => {
    setError(null);
    try {
      await registerUser(payload);
      navigate('/dashboard');
    } catch {
      setError('Registration failed. Try another email.');
    }
  });

  return (
    <Box className="auth-page">
      <Paper className="auth-panel" variant="outlined">
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="h1">Registration</Typography>
            <Typography color="text.secondary">Create a simple email/password account.</Typography>
          </Box>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Name" autoComplete="name" {...register('name', { required: true, minLength: 2 })} />
          <TextField label="Email" autoComplete="email" {...register('email', { required: true })} />
          <TextField label="Password" type="password" autoComplete="new-password" {...register('password', { required: true, minLength: 6 })} />
          <Button variant="contained" onClick={onSubmit} disabled={formState.isSubmitting}>Create account</Button>
          <Button component={Link} to="/login">I already have an account</Button>
        </Stack>
      </Paper>
    </Box>
  );
}
