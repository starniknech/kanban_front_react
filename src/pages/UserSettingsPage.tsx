import { Avatar, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SaveIcon from '@mui/icons-material/Save';
import { ChangeEvent, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { PageHeader } from '../components/common/PageHeader';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { getAssetUrl } from '../utils/assets';
import { getErrorMessage } from '../utils/errors';

interface SettingsForm {
  name: string;
}

export function UserSettingsPage() {
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const showNotification = useNotificationStore((state) => state.showNotification);
  const showError = useNotificationStore((state) => state.showError);
  const [avatar, setAvatar] = useState<File | undefined>();
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>();
  const { register, handleSubmit, formState } = useForm<SettingsForm>({
    mode: 'onBlur',
    values: {
      name: user?.name || '',
    },
  });

  const avatarSrc = useMemo(
    () => avatarPreview || getAssetUrl(user?.avatar),
    [avatarPreview, user?.avatar],
  );

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setAvatar(file);
    setAvatarPreview(file ? URL.createObjectURL(file) : undefined);
  };

  const submit = handleSubmit(async (payload) => {
    try {
      await updateProfile({ name: payload.name, avatar });
      showNotification('Profile updated', 'success');
      setAvatar(undefined);
    } catch (error) {
      showError(getErrorMessage(error, 'Failed to update profile'));
    }
  });

  return (
    <Stack spacing={3}>
      <PageHeader
        title="User settings"
        subtitle="Manage your public profile."
        actions={(
          <Button component={Link} to="/dashboard" startIcon={<ArrowBackIcon />} variant="outlined">
            Dashboard
          </Button>
        )}
      />

      <Paper variant="outlined" className="section-panel settings-panel">
        <Stack spacing={2.5}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { xs: 'flex-start', sm: 'center' } }}>
            <Avatar src={avatarSrc} sx={{ width: 88, height: 88, fontSize: '2rem' }}>
              {user?.name?.[0]?.toUpperCase()}
            </Avatar>
            <Stack spacing={1}>
              <Button component="label" startIcon={<PhotoCameraIcon />} variant="outlined">
                Change avatar
                <input hidden accept="image/*" type="file" onChange={handleAvatarChange} />
              </Button>
              <Typography variant="body2" color="text.secondary">
                JPG, PNG, or WebP image.
              </Typography>
            </Stack>
          </Stack>

          <TextField
            label="Name"
            error={Boolean(formState.errors.name)}
            helperText={formState.errors.name?.message}
            {...register('name', {
              required: 'Name is required',
              minLength: { value: 2, message: 'Name must be at least 2 characters' },
            })}
          />
          <TextField label="Email" value={user?.email || ''} disabled />

          <Box>
            <Button startIcon={<SaveIcon />} variant="contained" onClick={submit} disabled={formState.isSubmitting}>
              Save changes
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Stack>
  );
}
