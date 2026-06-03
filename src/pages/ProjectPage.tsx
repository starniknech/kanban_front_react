import { Button, Chip, Paper, Stack, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupsIcon from '@mui/icons-material/Groups';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { CollaboratorsModal } from '../modals/CollaboratorsModal';
import { useAuthStore } from '../store/authStore';
import { useProjectsStore } from '../store/projectsStore';
import { ProjectRole } from '../types/domain';
import { getCurrentMembership, getEntityId, getMemberUser, hasRole } from '../utils/entity';

export function ProjectPage() {
  const { projectId = '' } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const currentProject = useProjectsStore((state) => state.currentProject);
  const members = useProjectsStore((state) => state.members);
  const fetchProject = useProjectsStore((state) => state.fetchProject);
  const fetchMembers = useProjectsStore((state) => state.fetchMembers);
  const deleteProject = useProjectsStore((state) => state.deleteProject);
  const [collaboratorsOpen, setCollaboratorsOpen] = useState(false);

  useEffect(() => {
    if (projectId) {
      fetchProject(projectId);
      fetchMembers(projectId);
    }
  }, [fetchMembers, fetchProject, projectId]);

  const currentMembership = useMemo(
    () => getCurrentMembership(members, getEntityId(user)),
    [members, user],
  );
  const isOwner = hasRole(currentMembership?.role, ProjectRole.OWNER);

  const handleDelete = async () => {
    await deleteProject(projectId);
    navigate('/dashboard');
  };

  return (
    <Stack spacing={3}>
      <PageHeader
        title={currentProject?.name || 'Project'}
        subtitle={currentProject?.description || 'Project workspace'}
        actions={(
          <>
            <Button component={Link} to={'/project/' + projectId + '/tasks'} startIcon={<ViewKanbanIcon />} variant="contained">Tasks</Button>
            <Button startIcon={<GroupsIcon />} variant="outlined" onClick={() => setCollaboratorsOpen(true)}>Collaborators</Button>
            {isOwner && <Button startIcon={<DeleteIcon />} color="error" variant="outlined" onClick={handleDelete}>Delete</Button>}
          </>
        )}
      />

      <Paper variant="outlined" className="section-panel">
        <Stack spacing={2}>
          <Typography variant="h3">Members</Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            {members.map((member) => {
              const userInfo = getMemberUser(member);
              return (
                <Chip key={getEntityId(member)} label={(userInfo?.name || getEntityId(member.userId)) + ': ' + member.role.join(', ')} />
              );
            })}
          </Stack>
        </Stack>
      </Paper>

      <CollaboratorsModal
        open={collaboratorsOpen}
        onClose={() => setCollaboratorsOpen(false)}
        projectId={projectId}
        currentMembership={currentMembership}
      />
    </Stack>
  );
}
