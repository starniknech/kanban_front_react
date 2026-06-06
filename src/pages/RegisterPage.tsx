import { Avatar, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { Link, useNavigate } from 'react-router-dom';
import { ChangeEvent, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { RegisterPayload } from '../services/AuthService';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';

export function RegisterPage() {
  const navigate = useNavigate();
  const registerUser = useAuthStore((state) => state.register);
  const showNotification = useNotificationStore((state) => state.showNotification);
  const {
    register,
    handleSubmit,
    watch,
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
  const [avatar, setAvatar] = useState<File | undefined>();
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>();
  const watchedName = watch('name');

  const avatarInitial = useMemo(() => watchedName?.[0]?.toUpperCase(), [watchedName]);

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setAvatar(file);
    setAvatarPreview(file ? URL.createObjectURL(file) : undefined);
  };

  const onSubmit = handleSubmit(async (payload) => {
    setSubmitError(null);
    try {
      const result = await registerUser({ ...payload, avatar });
      if (result.avatarUploadFailed) {
        showNotification('Account created. You can retry avatar upload in settings.', 'warning');
      }
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

          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Avatar src={avatarPreview} sx={{ width: 64, height: 64, fontSize: '1.5rem' }}>
              {avatarInitial}
            </Avatar>
            <Button component="label" startIcon={<PhotoCameraIcon />} variant="outlined">
              Add avatar
              <input hidden accept="image/*" type="file" onChange={handleAvatarChange} />
            </Button>
          </Stack>

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
