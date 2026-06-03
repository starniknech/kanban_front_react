import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material';
import { useForm } from 'react-hook-form';

interface CreateProjectForm {
  name: string;
  description?: string;
}

export function CreateProjectModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateProjectForm) => Promise<void>;
}) {
  const { register, handleSubmit, reset, formState } = useForm<CreateProjectForm>();

  const submit = handleSubmit(async (payload) => {
    await onSubmit(payload);
    reset();
    onClose();
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create project</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField label="Name" {...register('name', { required: true, minLength: 2 })} />
          <TextField label="Description" multiline minRows={3} {...register('description')} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={submit} variant="contained" disabled={formState.isSubmitting}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
