import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { RegisterPayload } from '../services/AuthService';
import { useAuthStore } from '../store/authStore';

export function RegisterPage() {
  const navigate = useNavigate();
  const registerUser = useAuthStore((state) => state.register);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterPayload>({
    mode: 'onBlur',
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });
  const [submitError, setSubmitError] = useState<string | null>(null);

  const onSubmit = handleSubmit(async (payload) => {
    setSubmitError(null);
    try {
      await registerUser(payload);
      navigate('/dashboard');
    } catch {
      setSubmitError('Registration failed. Try another email');
    }
  });

  return (
    <Box className="auth-page">
      <Paper className="auth-panel" variant="outlined">
        <Stack spacing={2.25}>
          <Box className="auth-heading">
            <Typography variant="h1">Registration</Typography>
            <Typography color="text.secondary">Create a simple email/password account.</Typography>
          </Box>

          <TextField
            label="Name"
            autoComplete="name"
            error={Boolean(errors.name)}
            helperText={errors.name?.message}
            {...register('name', {
              required: 'Name is required',
              minLength: {
                value: 2,
                message: 'Name must be at least 2 characters',
              },
            })}
          />
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
            autoComplete="new-password"
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

          <Typography component={Link} to="/login" className="auth-text-link">
            I already have an account
          </Typography>

          <Button variant="contained" onClick={onSubmit} disabled={isSubmitting} className="auth-submit">
            Create account
          </Button>
          {submitError && <Typography className="auth-submit-error">{submitError}</Typography>}
        </Stack>
      </Paper>
    </Box>
  );
}
