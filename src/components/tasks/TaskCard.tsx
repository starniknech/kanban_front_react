import { Avatar, AvatarGroup, Box, Chip, Paper, Stack, Tooltip, Typography } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { HTMLAttributes } from 'react';
import { Link } from 'react-router-dom';
import { Task } from '../../types/domain';
import { getAssetUrl } from '../../utils/assets';
import { getEntityId, getMemberUser } from '../../utils/entity';

const priorityColor: Record<string, 'default' | 'primary' | 'secondary' | 'warning' | 'error'> = {
  low: 'default',
  medium: 'primary',
  high: 'warning',
  urgent: 'error',
};

export function TaskCard({
  projectId,
  task,
  dragProps,
}: {
  projectId: string;
  task: Task;
  dragProps?: HTMLAttributes<HTMLDivElement>;
}) {
  const taskId = getEntityId(task);

  return (
    <Paper {...dragProps} variant="outlined" className="task-card">
      <Stack spacing={1}>
        <Box className="task-card__topline">
          <Typography
            component={Link}
            to={'/project/' + projectId + '/tasks/' + taskId}
            variant="subtitle1"
            className="task-card__title-link"
            title={task.title}
          >
            {task.title}
          </Typography>
          <Tooltip title="Drag task">
            <span className="task-card__drag-handle" aria-hidden="true">
              <DragIndicatorIcon fontSize="small" />
            </span>
          </Tooltip>
        </Box>
        {task.description && (
          <Typography variant="body2" color="text.secondary" className="task-card__description">
            {task.description}
          </Typography>
        )}
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Chip size="small" label={task.priority} color={priorityColor[task.priority] || 'default'} />
          {task.dueDate && <Chip size="small" label={new Date(task.dueDate).toLocaleDateString()} />}
        </Stack>
        {task.assignees?.length > 0 && (
          <AvatarGroup max={4} className="task-card__assignees">
            {task.assignees.map((member) => {
              const user = getMemberUser(member);
              const memberId = getEntityId(member);
              return (
                <Tooltip key={memberId} title={user ? user.name + ' · ' + user.email : memberId}>
                  <Avatar src={getAssetUrl(user?.avatar)} sx={{ width: 28, height: 28 }}>
                    {user?.name?.[0]?.toUpperCase()}
                  </Avatar>
                </Tooltip>
              );
            })}
          </AvatarGroup>
        )}
      </Stack>
    </Paper>
  );
}
