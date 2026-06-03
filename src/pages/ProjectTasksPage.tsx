import { Button, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { KanbanColumn } from '../components/tasks/KanbanColumn';
import { CreateTaskModal } from '../modals/CreateTaskModal';
import { useProjectSocket } from '../hooks/socket/useProjectSocket';
import { useTasksStore } from '../store/tasksStore';
import { Task, TaskStatus } from '../types/domain';

const columns = [
  { status: TaskStatus.TODO, label: 'Todo' },
  { status: TaskStatus.IN_PROGRESS, label: 'In progress' },
  { status: TaskStatus.REVIEW, label: 'Review' },
  { status: TaskStatus.DONE, label: 'Done' },
];

export function ProjectTasksPage() {
  const { projectId = '' } = useParams();
  const tasks = useTasksStore((state) => state.tasks);
  const fetchTasks = useTasksStore((state) => state.fetchTasks);
  const createTask = useTasksStore((state) => state.createTask);
  const moveTask = useTasksStore((state) => state.moveTask);
  const [createOpen, setCreateOpen] = useState(false);
  useProjectSocket(projectId);

  useEffect(() => {
    if (projectId) fetchTasks(projectId);
  }, [fetchTasks, projectId]);

  const groupedTasks = useMemo(() => {
    return columns.reduce<Record<TaskStatus, Task[]>>((acc, column) => {
      acc[column.status] = tasks.filter((task) => task.status === column.status);
      return acc;
    }, {
      [TaskStatus.TODO]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.REVIEW]: [],
      [TaskStatus.DONE]: [],
    });
  }, [tasks]);

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Tasks"
        subtitle="Kanban board synchronized through project realtime events."
        actions={(
          <>
            <Button component={Link} to={'/project/' + projectId} startIcon={<ArrowBackIcon />} variant="outlined">Project</Button>
            <Button startIcon={<AddIcon />} variant="contained" onClick={() => setCreateOpen(true)}>Create task</Button>
          </>
        )}
      />

      <div className="kanban-board">
        {columns.map((column) => (
          <KanbanColumn
            key={column.status}
            projectId={projectId}
            status={column.status}
            label={column.label}
            tasks={groupedTasks[column.status]}
            onMove={(taskId, status) => moveTask(projectId, taskId, { status })}
          />
        ))}
      </div>

      <CreateTaskModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={async (payload) => {
          await createTask(projectId, {
            ...payload,
            position: tasks.length,
            status: payload.status || TaskStatus.TODO,
          });
        }}
      />
    </Stack>
  );
}
