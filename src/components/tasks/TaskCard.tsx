import { Chip, Paper, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { Task } from '../../types/domain';
import { getEntityId } from '../../utils/entity';

const priorityColor: Record<string, 'default' | 'primary' | 'secondary' | 'warning' | 'error'> = {
  low: 'default',
  medium: 'primary',
  high: 'warning',
  urgent: 'error',
};

export function TaskCard({ projectId, task }: { projectId: string; task: Task }) {
  const taskId = getEntityId(task);

  return (
    <Paper component={Link} to={'/project/' + projectId + '/tasks/' + taskId} variant="outlined" className="task-card">
      <Stack spacing={1}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {task.title}
        </Typography>
        {task.description && (
          <Typography variant="body2" color="text.secondary" className="task-card__description">
            {task.description}
          </Typography>
        )}
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Chip size="small" label={task.priority} color={priorityColor[task.priority] || 'default'} />
          {task.dueDate && <Chip size="small" label={new Date(task.dueDate).toLocaleDateString()} />}
        </Stack>
      </Stack>
    </Paper>
  );
}
