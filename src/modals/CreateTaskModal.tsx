import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from '@mui/material';
import { useForm } from 'react-hook-form';
import { CreateTaskPayload, TaskPriority, TaskStatus } from '../types/domain';

export function CreateTaskModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateTaskPayload) => Promise<void>;
}) {
  const { register, handleSubmit, reset, formState } = useForm<CreateTaskPayload>({
    defaultValues: {
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      position: 0,
    },
  });

  const submit = handleSubmit(async (payload) => {
    await onSubmit(payload);
    reset({ status: TaskStatus.TODO, priority: TaskPriority.MEDIUM, position: 0 });
    onClose();
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create task</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField label="Title" {...register('title', { required: true, minLength: 2 })} />
          <TextField label="Description" multiline minRows={3} {...register('description')} />
          <TextField select label="Status" defaultValue={TaskStatus.TODO} {...register('status')}>
            {Object.values(TaskStatus).map((status) => (
              <MenuItem key={status} value={status}>{status}</MenuItem>
            ))}
          </TextField>
          <TextField select label="Priority" defaultValue={TaskPriority.MEDIUM} {...register('priority')}>
            {Object.values(TaskPriority).map((priority) => (
              <MenuItem key={priority} value={priority}>{priority}</MenuItem>
            ))}
          </TextField>
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
