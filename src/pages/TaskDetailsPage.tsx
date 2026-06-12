import { Box, Button, Checkbox, CircularProgress, ListItemText, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useProjectSocket } from '../hooks/socket/useProjectSocket';
import { useNotificationStore } from '../store/notificationStore';
import { useProjectsStore } from '../store/projectsStore';
import { useTasksStore } from '../store/tasksStore';
import { TaskPriority, TaskStatus, UpdateTaskPayload } from '../types/domain';
import { getEntityId, getMemberUser } from '../utils/entity';
import { getErrorMessage } from '../utils/errors';

export function TaskDetailsPage() {
  const { projectId = '', taskId = '' } = useParams();
  const navigate = useNavigate();
  const currentTask = useTasksStore((state) => state.currentTask);
  const isTaskLoading = useTasksStore((state) => state.isLoading);
  const fetchTask = useTasksStore((state) => state.fetchTask);
  const updateTask = useTasksStore((state) => state.updateTask);
  const deleteTask = useTasksStore((state) => state.deleteTask);
  const members = useProjectsStore((state) => state.members);
  const fetchMembers = useProjectsStore((state) => state.fetchMembers);
  const showNotification = useNotificationStore((state) => state.showNotification);
  const showError = useNotificationStore((state) => state.showError);
  const { control, register, handleSubmit, reset, formState } = useForm<UpdateTaskPayload>();
  useProjectSocket(projectId);
  const isCurrentTaskReady = Boolean(currentTask && getEntityId(currentTask) === taskId);

  useEffect(() => {
    if (projectId && taskId) {
      fetchTask(projectId, taskId);
      fetchMembers(projectId);
    }
  }, [fetchMembers, fetchTask, projectId, taskId]);

  useEffect(() => {
    if (isCurrentTaskReady && currentTask) {
      reset({
        title: currentTask.title,
        description: currentTask.description || '',
        status: currentTask.status,
        priority: currentTask.priority,
        dueDate: currentTask.dueDate || undefined,
        assignees: currentTask.assignees?.map((member) => getEntityId(member)) || [],
      });
    }
  }, [currentTask, isCurrentTaskReady, reset]);

  const submit = handleSubmit(async (payload) => {
    try {
      await updateTask(projectId, taskId, payload);
      showNotification('Task updated', 'success');
    } catch (error) {
      showError(getErrorMessage(error, 'Failed to update task'));
    }
  });

  const handleDelete = async () => {
    try {
      await deleteTask(projectId, taskId);
      navigate('/project/' + projectId);
    } catch (error) {
      showError(getErrorMessage(error, 'Failed to delete task'));
    }
  };

  return (
    <Stack spacing={3}>
      <Box className="task-details-header">
        <Box className="task-details-actions">
          <Button component={Link} to={'/project/' + projectId} startIcon={<ArrowBackIcon />} variant="outlined">Project</Button>
          <Button color="error" startIcon={<DeleteIcon />} variant="outlined" onClick={handleDelete} disabled={!isCurrentTaskReady}>Delete</Button>
        </Box>
        <Typography variant="h1" className="task-details-title">{isCurrentTaskReady ? currentTask?.title : 'Task'}</Typography>
      </Box>

      {!isCurrentTaskReady || isTaskLoading ? (
        <Paper variant="outlined" className="section-panel task-details-loader">
          <CircularProgress />
        </Paper>
      ) : (
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
                    return (
                      <MenuItem key={memberId} value={memberId}>
                        <Checkbox checked={Boolean(field.value?.includes(memberId))} />
                        <ListItemText primary={user?.name || memberId} secondary={user?.email} />
                      </MenuItem>
                    );
                  })}
                </TextField>
              )}
            />
            <TextField label="Due date" type="date" slotProps={{ inputLabel: { shrink: true } }} {...register('dueDate')} />
            <Button variant="contained" onClick={submit} disabled={formState.isSubmitting}>Save</Button>
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}
