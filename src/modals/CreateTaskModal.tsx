import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, ListItemText, MenuItem, Stack, TextField } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { CreateTaskPayload, TaskPriority, TaskStatus, UserProject } from '../types/domain';
import { getEntityId, getMemberUser } from '../utils/entity';

export function CreateTaskModal({
  open,
  onClose,
  onSubmit,
  members,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateTaskPayload) => Promise<void>;
  members: UserProject[];
}) {
  const { control, register, handleSubmit, reset, formState } = useForm<CreateTaskPayload>({
    defaultValues: {
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      position: 0,
      assignees: [],
    },
  });

  const submit = handleSubmit(async (payload) => {
    await onSubmit(payload);
    reset({ status: TaskStatus.TODO, priority: TaskPriority.MEDIUM, position: 0, assignees: [] });
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
          <Controller
            name="assignees"
            control={control}
            render={({ field }) => (
              <TextField
                select
                label="Assign to"
                slotProps={{
                  select: {
                    multiple: true,
                    value: field.value || [],
                    onChange: field.onChange,
                    renderValue: (selected) =>
                      (selected as string[])
                        .map((memberId) => {
                          const member = members.find((item) => getEntityId(item) === memberId);
                          return member ? getMemberUser(member)?.name || memberId : memberId;
                        })
                        .join(', '),
                  },
                }}
              >
                {members.map((member) => {
                  const memberId = getEntityId(member);
                  const user = getMemberUser(member);
                  const selected = Boolean(field.value?.includes(memberId));
                  return (
                    <MenuItem key={memberId} value={memberId}>
                      <Checkbox checked={selected} />
                      <ListItemText primary={user?.name || memberId} secondary={user?.email} />
                    </MenuItem>
                  );
                })}
              </TextField>
            )}
          />
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
