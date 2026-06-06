import { Navigate, useParams } from 'react-router-dom';

export function ProjectTasksPage() {
  const { projectId = '' } = useParams();

  return <Navigate to={'/project/' + projectId} replace />;
}
