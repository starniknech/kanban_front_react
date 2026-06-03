import { Button, Paper, Stack, Typography } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { TaskCard } from './TaskCard';
import { Task, TaskStatus } from '../../types/domain';
import { getEntityId } from '../../utils/entity';

const statusOrder = [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.REVIEW, TaskStatus.DONE];

export function KanbanColumn({
  projectId,
  status,
  label,
  tasks,
  onMove,
}: {
  projectId: string;
  status: TaskStatus;
  label: string;
  tasks: Task[];
  onMove: (taskId: string, status: TaskStatus) => void;
}) {
  const nextStatus = statusOrder[statusOrder.indexOf(status) + 1];

  return (
    <Paper variant="outlined" className="kanban-column">
      <Stack spacing={1.5}>
        <Typography variant="h3">{label}</Typography>
        <Typography variant="caption" color="text.secondary">
          {tasks.length} tasks
        </Typography>
        {tasks.map((task) => {
          const taskId = getEntityId(task);
          return (
            <Stack key={taskId} spacing={1}>
              <TaskCard projectId={projectId} task={task} />
              {nextStatus && (
                <Button
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => onMove(taskId, nextStatus)}
                >
                  Move to {nextStatus}
                </Button>
              )}
            </Stack>
          );
        })}
      </Stack>
    </Paper>
  );
}
