import { Paper, Stack, Typography } from '@mui/material';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskCard } from './TaskCard';
import { Task, TaskStatus } from '../../types/domain';
import { getEntityId } from '../../utils/entity';

const getColumnId = (status: TaskStatus) => 'column:' + status;

function SortableTaskCard({ projectId, task }: { projectId: string; task: Task }) {
  const taskId = getEntityId(task);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: taskId });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.55 : 1,
      }}
    >
      <TaskCard
        projectId={projectId}
        task={task}
        dragProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

export function KanbanColumn({
  projectId,
  status,
  label,
  tasks,
}: {
  projectId: string;
  status: TaskStatus;
  label: string;
  tasks: Task[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: getColumnId(status) });

  return (
    <Paper
      ref={setNodeRef}
      variant="outlined"
      className={isOver ? 'kanban-column kanban-column--over' : 'kanban-column'}
    >
      <Stack spacing={1.5}>
        <Typography variant="h3">{label}</Typography>
        <Typography variant="caption" color="text.secondary">
          {tasks.length} tasks
        </Typography>
        <SortableContext items={tasks.map((task) => getEntityId(task))} strategy={verticalListSortingStrategy}>
          <Stack spacing={1.25} className="kanban-column__tasks">
            {tasks.map((task) => (
              <SortableTaskCard key={getEntityId(task)} projectId={projectId} task={task} />
            ))}
          </Stack>
        </SortableContext>
      </Stack>
    </Paper>
  );
}
