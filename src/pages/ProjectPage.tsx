import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import GroupsIcon from '@mui/icons-material/Groups';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import ViewListIcon from '@mui/icons-material/ViewList';
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { KanbanColumn } from '../components/tasks/KanbanColumn';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskListView } from '../components/tasks/TaskListView';
import { useProjectSocket } from '../hooks/socket/useProjectSocket';
import { CollaboratorsModal } from '../modals/CollaboratorsModal';
import { CreateTaskModal } from '../modals/CreateTaskModal';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { useProjectsStore } from '../store/projectsStore';
import { useTasksStore } from '../store/tasksStore';
import { ProjectRole, Task, TaskStatus } from '../types/domain';
import { getAssetUrl } from '../utils/assets';
import { getCurrentMembership, getEntityId, getMemberUser, hasRole } from '../utils/entity';
import { getErrorMessage } from '../utils/errors';

const columns = [
  { status: TaskStatus.TODO, label: 'Todo' },
  { status: TaskStatus.IN_PROGRESS, label: 'In progress' },
  { status: TaskStatus.REVIEW, label: 'Review' },
  { status: TaskStatus.DONE, label: 'Done' },
];

const columnIdPrefix = 'column:';

interface RenameForm {
  name: string;
}

type TaskView = 'kanban' | 'list';

function sortByPosition(first: Task, second: Task) {
  return first.position - second.position;
}

export function ProjectPage() {
  const { projectId = '' } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const currentProject = useProjectsStore((state) => state.currentProject);
  const members = useProjectsStore((state) => state.members);
  const onlineUsers = useProjectsStore((state) => state.onlineUsers);
  const deletedProjectId = useProjectsStore((state) => state.deletedProjectId);
  const fetchProject = useProjectsStore((state) => state.fetchProject);
  const fetchMembers = useProjectsStore((state) => state.fetchMembers);
  const updateProject = useProjectsStore((state) => state.updateProject);
  const deleteProject = useProjectsStore((state) => state.deleteProject);
  const tasks = useTasksStore((state) => state.tasks);
  const fetchTasks = useTasksStore((state) => state.fetchTasks);
  const createTask = useTasksStore((state) => state.createTask);
  const moveTask = useTasksStore((state) => state.moveTask);
  const optimisticMoveTasks = useTasksStore((state) => state.optimisticMoveTasks);
  const replaceTasks = useTasksStore((state) => state.replaceTasks);
  const showNotification = useNotificationStore((state) => state.showNotification);
  const showError = useNotificationStore((state) => state.showError);
  const [collaboratorsOpen, setCollaboratorsOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [taskView, setTaskView] = useState<TaskView>('kanban');
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  useProjectSocket(projectId);

  const { register, handleSubmit, reset, formState } = useForm<RenameForm>({
    values: {
      name: currentProject?.name || '',
    },
  });

  useEffect(() => {
    if (projectId) {
      fetchProject(projectId);
      fetchMembers(projectId);
      fetchTasks(projectId);
    }
  }, [fetchMembers, fetchProject, fetchTasks, projectId]);

  useEffect(() => {
    if (deletedProjectId === projectId) {
      showNotification('Project deleted', 'info');
      navigate('/dashboard');
    }
  }, [deletedProjectId, navigate, projectId, showNotification]);

  const currentMembership = useMemo(
    () => getCurrentMembership(members, getEntityId(user)),
    [members, user],
  );
  const isOwner = hasRole(currentMembership?.role, ProjectRole.OWNER);
  const isAdmin = hasRole(currentMembership?.role, ProjectRole.ADMIN);

  const groupedTasks = useMemo(() => {
    return columns.reduce<Record<TaskStatus, Task[]>>((acc, column) => {
      acc[column.status] = tasks.filter((task) => task.status === column.status).sort(sortByPosition);
      return acc;
    }, {
      [TaskStatus.TODO]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.REVIEW]: [],
      [TaskStatus.DONE]: [],
    });
  }, [tasks]);

  const listTasks = useMemo(() => {
    const statusRank = Object.fromEntries(columns.map((column, index) => [column.status, index]));
    return [...tasks].sort((first, second) => {
      const statusDiff = statusRank[first.status] - statusRank[second.status];
      return statusDiff || first.position - second.position;
    });
  }, [tasks]);

  const activeTask = useMemo(
    () => tasks.find((task) => getEntityId(task) === activeTaskId) || null,
    [activeTaskId, tasks],
  );

  const isOnline = (memberId: string, userId?: string) =>
    onlineUsers.some((onlineUser) => onlineUser.membershipId === memberId || onlineUser.userId === userId);

  const handleDelete = async () => {
    try {
      await deleteProject(projectId);
      navigate('/dashboard');
    } catch (error) {
      showError(getErrorMessage(error, 'Failed to delete project'));
    }
  };

  const submitRename = handleSubmit(async (payload) => {
    try {
      await updateProject(projectId, payload);
      showNotification('Project updated', 'success');
      setRenameOpen(false);
    } catch (error) {
      showError(getErrorMessage(error, 'Failed to update project'));
    }
  });

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveTaskId(String(active.id));
  };

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    const activeTaskId = String(active.id);

    if (!over) {
      setActiveTaskId(null);
      return;
    }

    const overId = String(over.id);
    const activeTask = tasks.find((task) => getEntityId(task) === activeTaskId);

    if (!activeTask) {
      setActiveTaskId(null);
      return;
    }

    const overTask = tasks.find((task) => getEntityId(task) === overId);
    const targetStatus = overId.startsWith(columnIdPrefix)
      ? overId.replace(columnIdPrefix, '') as TaskStatus
      : overTask?.status;

    if (!targetStatus) {
      setActiveTaskId(null);
      return;
    }

    const nextByStatus = columns.reduce<Record<TaskStatus, Task[]>>((acc, column) => {
      acc[column.status] = [...groupedTasks[column.status]];
      return acc;
    }, {
      [TaskStatus.TODO]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.REVIEW]: [],
      [TaskStatus.DONE]: [],
    });

    const sourceStatus = activeTask.status;
    const sourceList = nextByStatus[sourceStatus];
    const sourceIndex = sourceList.findIndex((task) => getEntityId(task) === activeTaskId);

    if (sourceIndex === -1) {
      setActiveTaskId(null);
      return;
    }

    sourceList.splice(sourceIndex, 1);

    const targetList = nextByStatus[targetStatus];
    const overIndex = overTask
      ? targetList.findIndex((task) => getEntityId(task) === overId)
      : targetList.length;
    const insertIndex = overIndex >= 0 ? overIndex : targetList.length;

    targetList.splice(insertIndex, 0, { ...activeTask, status: targetStatus });

    const affectedStatuses = sourceStatus === targetStatus ? [targetStatus] : [sourceStatus, targetStatus];
    const updates = affectedStatuses.flatMap((status) =>
      nextByStatus[status]
        .map((task, position) => ({ task, status, position }))
        .filter(({ task, status, position }) => {
          const originalTask = tasks.find((item) => getEntityId(item) === getEntityId(task));
          return originalTask?.status !== status || originalTask?.position !== position;
        }),
    );

    const optimisticUpdates = updates.map(({ task, status, position }) => ({
      taskId: getEntityId(task),
      status,
      position,
    }));
    const previousTasks = tasks;

    optimisticMoveTasks(optimisticUpdates);
    setActiveTaskId(null);

    try {
      await Promise.all(
        updates.map(({ task, status, position }) =>
          moveTask(projectId, getEntityId(task), { status, position }),
        ),
      );
    } catch (error) {
      replaceTasks(previousTasks);
      showError(getErrorMessage(error, 'Failed to move task'));
      fetchTasks(projectId);
    }
  };

  const openRename = () => {
    reset({
      name: currentProject?.name || '',
    });
    setRenameOpen(true);
  };

  return (
    <Stack spacing={3} className={activeTaskId ? 'project-workspace project-workspace--dragging' : 'project-workspace'}>
      <Box>
        <Button component={Link} to="/dashboard" startIcon={<ArrowBackIcon />} variant="outlined">
          Go back to dashboard
        </Button>
      </Box>

      <Box className="project-workspace__header">
        <Stack spacing={1.25} className="project-workspace__identity">
          <Stack spacing={0.5}>
            <Typography variant="h1">{currentProject?.name || 'Project'}</Typography>
            <Typography color="text.secondary">
              {currentProject?.description || 'Project workspace'}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.5}>
            {isAdmin && (
              <Tooltip title="Rename project">
                <IconButton className="icon-button-black" onClick={openRename}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
            )}
            {isOwner && (
              <Tooltip title="Delete project">
                <IconButton className="icon-button-black" onClick={handleDelete}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Stack>

        <Stack direction="row" spacing={1.5} className="project-workspace__members">
          <Tooltip title="Invite and manage members">
            <IconButton className="icon-button-black" onClick={() => setCollaboratorsOpen(true)}>
              <GroupsIcon />
            </IconButton>
          </Tooltip>
          <AvatarGroup max={8} className="member-avatar-group">
            {members.map((member) => {
              const memberId = getEntityId(member);
              const memberUser = getMemberUser(member);
              const memberUserId = getEntityId(memberUser);
              return (
                <Tooltip
                  key={memberId}
                  title={memberUser ? memberUser.name + ' · ' + memberUser.email : memberId}
                >
                  <Avatar
                    src={getAssetUrl(memberUser?.avatar)}
                    className={isOnline(memberId, memberUserId) ? 'member-avatar member-avatar--online' : 'member-avatar'}
                  >
                    {memberUser?.name?.[0]?.toUpperCase()}
                  </Avatar>
                </Tooltip>
              );
            })}
          </AvatarGroup>
        </Stack>
      </Box>

      <Stack spacing={2}>
        <Typography variant="h3">Projects workspace</Typography>
        <Box className="tasks-toolbar">
          <ToggleButtonGroup
            exclusive
            size="small"
            value={taskView}
            onChange={(_, value: TaskView | null) => {
              if (value) setTaskView(value);
            }}
          >
            <ToggleButton value="kanban" aria-label="Kanban view">
              <ViewKanbanIcon />
            </ToggleButton>
            <ToggleButton value="list" aria-label="List view">
              <ViewListIcon />
            </ToggleButton>
          </ToggleButtonGroup>
          <Button startIcon={<AddIcon />} variant="contained" onClick={() => setCreateOpen(true)}>
            Create task
          </Button>
        </Box>

        {taskView === 'kanban' ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setActiveTaskId(null)}
          >
            <div className="kanban-board">
              {columns.map((column) => (
                <KanbanColumn
                  key={column.status}
                  projectId={projectId}
                  status={column.status}
                  label={column.label}
                  tasks={groupedTasks[column.status]}
                />
              ))}
            </div>
            <DragOverlay dropAnimation={null}>
              {activeTask ? (
                <div className="task-card-drag-overlay">
                  <TaskCard projectId={projectId} task={activeTask} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        ) : (
          <TaskListView projectId={projectId} tasks={listTasks} />
        )}
      </Stack>

      <Dialog open={renameOpen} onClose={() => setRenameOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Rename project</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Name"
              error={Boolean(formState.errors.name)}
              helperText={formState.errors.name?.message}
              {...register('name', {
                required: 'Name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' },
              })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={submitRename} disabled={formState.isSubmitting}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <CreateTaskModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        members={members}
        onSubmit={async (payload) => {
          try {
            await createTask(projectId, {
              ...payload,
              position: groupedTasks[payload.status || TaskStatus.TODO].length,
              status: payload.status || TaskStatus.TODO,
            });
          } catch (error) {
            showError(getErrorMessage(error, 'Failed to create task'));
            throw error;
          }
        }}
      />

      <CollaboratorsModal
        open={collaboratorsOpen}
        onClose={() => setCollaboratorsOpen(false)}
        projectId={projectId}
        currentMembership={currentMembership}
      />
    </Stack>
  );
}
