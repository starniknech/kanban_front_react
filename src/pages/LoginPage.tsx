import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { LoginPayload } from '../services/AuthService';
import { useAuthStore } from '../store/authStore';

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginPayload>({
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const [submitError, setSubmitError] = useState<string | null>(null);

  const onSubmit = handleSubmit(async (payload) => {
    setSubmitError(null);
    try {
      await login(payload);
      navigate('/dashboard');
    } catch {
      setSubmitError('Incorrect email or password');
    }
  });

  return (
    <Box className="auth-page">
      <Paper className="auth-panel" variant="outlined">
        <Stack spacing={2.25}>
          <Box className="auth-heading">
            <Typography variant="h1">Login</Typography>
            <Typography color="text.secondary">Enter your account to manage projects.</Typography>
          </Box>

          <TextField
            label="Email"
            autoComplete="email"
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Enter a valid email',
              },
            })}
          />
          <TextField
            label="Password"
            type="password"
            autoComplete="current-password"
            error={Boolean(errors.password)}
            helperText={errors.password?.message}
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters',
              },
            })}
          />

          <Typography component={Link} to="/registration" className="auth-text-link">
            Create account
          </Typography>

          <Button variant="contained" onClick={onSubmit} disabled={isSubmitting} className="auth-submit">
            Login
          </Button>
          {submitError && <Typography className="auth-submit-error">{submitError}</Typography>}
        </Stack>
      </Paper>
    </Box>
  );
}
