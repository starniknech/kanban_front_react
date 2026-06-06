import { Avatar, AvatarGroup, Box, Chip, Paper, Stack, Tooltip, Typography } from '@mui/material';
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

export function TaskListView({ projectId, tasks }: { projectId: string; tasks: Task[] }) {
  return (
    <Stack spacing={1}>
      {tasks.map((task) => {
        const taskId = getEntityId(task);
        return (
          <Paper
            key={taskId}
            component={Link}
            to={'/project/' + projectId + '/tasks/' + taskId}
            variant="outlined"
            className="task-list-row"
          >
            <Box className="task-list-row__main">
              <Typography className="task-list-row__title">{task.title}</Typography>
              <Tooltip title={task.description || ''} disableHoverListener={!task.description}>
                <Typography color="text.secondary" className="task-list-row__description">
                  {task.description || 'No description'}
                </Typography>
              </Tooltip>
            </Box>
            <Stack direction="row" spacing={1} className="task-list-row__meta">
              <Chip size="small" label={task.status} />
              <Chip size="small" label={task.priority} color={priorityColor[task.priority] || 'default'} />
              {task.dueDate && <Chip size="small" label={new Date(task.dueDate).toLocaleDateString()} />}
              <AvatarGroup max={4} className="task-list-row__assignees">
                {task.assignees?.map((member) => {
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
            </Stack>
          </Paper>
        );
      })}
    </Stack>
  );
}
