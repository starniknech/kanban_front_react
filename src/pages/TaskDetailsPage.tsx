import { Button, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { PageHeader } from '../components/common/PageHeader';
import { useTasksStore } from '../store/tasksStore';
import { TaskPriority, TaskStatus, UpdateTaskPayload } from '../types/domain';

export function TaskDetailsPage() {
  const { projectId = '', taskId = '' } = useParams();
  const navigate = useNavigate();
  const currentTask = useTasksStore((state) => state.currentTask);
  const fetchTask = useTasksStore((state) => state.fetchTask);
  const updateTask = useTasksStore((state) => state.updateTask);
  const deleteTask = useTasksStore((state) => state.deleteTask);
  const { register, handleSubmit, reset, formState } = useForm<UpdateTaskPayload>();

  useEffect(() => {
    if (projectId && taskId) fetchTask(projectId, taskId);
  }, [fetchTask, projectId, taskId]);

  useEffect(() => {
    if (currentTask) {
      reset({
        title: currentTask.title,
        description: currentTask.description || '',
        status: currentTask.status,
        priority: currentTask.priority,
        dueDate: currentTask.dueDate || undefined,
      });
    }
  }, [currentTask, reset]);

  const submit = handleSubmit(async (payload) => {
    await updateTask(projectId, taskId, payload);
  });

  const handleDelete = async () => {
    await deleteTask(projectId, taskId);
    navigate('/project/' + projectId + '/tasks');
  };

  return (
    <Stack spacing={3}>
      <PageHeader
        title={currentTask?.title || 'Task'}
        actions={(
          <>
            <Button component={Link} to={'/project/' + projectId + '/tasks'} startIcon={<ArrowBackIcon />} variant="outlined">Board</Button>
            <Button color="error" startIcon={<DeleteIcon />} variant="outlined" onClick={handleDelete}>Delete</Button>
          </>
        )}
      />

      <Paper variant="outlined" className="section-panel task-details-form">
        <Stack spacing={2}>
          <Typography variant="h3">Details</Typography>
          <TextField label="Title" {...register('title', { required: true, minLength: 2 })} />
          <TextField label="Description" multiline minRows={4} {...register('description')} />
          <TextField select label="Status" defaultValue={currentTask?.status || TaskStatus.TODO} {...register('status')}>
            {Object.values(TaskStatus).map((status) => (
              <MenuItem key={status} value={status}>{status}</MenuItem>
            ))}
          </TextField>
          <TextField select label="Priority" defaultValue={currentTask?.priority || TaskPriority.MEDIUM} {...register('priority')}>
            {Object.values(TaskPriority).map((priority) => (
              <MenuItem key={priority} value={priority}>{priority}</MenuItem>
            ))}
          </TextField>
          <TextField label="Due date" type="date" slotProps={{ inputLabel: { shrink: true } }} {...register('dueDate')} />
          <Button variant="contained" onClick={submit} disabled={formState.isSubmitting}>Save</Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
