import { useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { useTasksStore } from '../../store/tasksStore';
import { RealtimeEvent, Task } from '../../types/domain';

export function useTaskSocketEvents(socket: Socket | null) {
  const upsertTask = useTasksStore((state) => state.upsertTask);
  const removeTask = useTasksStore((state) => state.removeTask);

  useEffect(() => {
    if (!socket) return;

    const handleTaskUpsert = (task: Task | null) => upsertTask(task);
    const handleTaskDelete = (task: Task | null) => removeTask(task);

    socket.on(RealtimeEvent.TASK_CREATED, handleTaskUpsert);
    socket.on(RealtimeEvent.TASK_UPDATED, handleTaskUpsert);
    socket.on(RealtimeEvent.TASK_MOVED, handleTaskUpsert);
    socket.on(RealtimeEvent.TASK_DELETED, handleTaskDelete);

    return () => {
      socket.off(RealtimeEvent.TASK_CREATED, handleTaskUpsert);
      socket.off(RealtimeEvent.TASK_UPDATED, handleTaskUpsert);
      socket.off(RealtimeEvent.TASK_MOVED, handleTaskUpsert);
      socket.off(RealtimeEvent.TASK_DELETED, handleTaskDelete);
    };
  }, [removeTask, socket, upsertTask]);
}
