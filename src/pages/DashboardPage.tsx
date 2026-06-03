import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MailIcon from '@mui/icons-material/Mail';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { EmptyState } from '../components/common/EmptyState';
import { PageHeader } from '../components/common/PageHeader';
import { CreateProjectModal } from '../modals/CreateProjectModal';
import { InvitationsModal } from '../modals/InvitationsModal';
import { useProjectsStore } from '../store/projectsStore';
import { getEntityId } from '../utils/entity';

export function DashboardPage() {
  const projects = useProjectsStore((state) => state.projects);
  const fetchProjects = useProjectsStore((state) => state.fetchProjects);
  const createProject = useProjectsStore((state) => state.createProject);
  const [createOpen, setCreateOpen] = useState(false);
  const [invitationsOpen, setInvitationsOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Dashboard"
        subtitle="Projects you participate in."
        actions={(
          <>
            <Button startIcon={<MailIcon />} variant="outlined" onClick={() => setInvitationsOpen(true)}>Invitations</Button>
            <Button startIcon={<AddIcon />} variant="contained" onClick={() => setCreateOpen(true)}>Create project</Button>
          </>
        )}
      />

      {projects.length === 0 ? (
        <EmptyState title="No projects yet" text="Create your first project or accept an invitation." />
      ) : (
        <Box className="project-grid">
          {projects.map((project) => {
            const projectId = getEntityId(project);
            return (
              <Paper key={projectId} component={Link} to={'/project/' + projectId} variant="outlined" className="project-card">
                <Stack spacing={1}>
                  <Typography variant="h3">{project.name}</Typography>
                  <Typography color="text.secondary">{project.description || 'No description'}</Typography>
                </Stack>
              </Paper>
            );
          })}
        </Box>
      )}

      <CreateProjectModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={async (payload) => { await createProject(payload); }}
      />
      <InvitationsModal open={invitationsOpen} onClose={() => setInvitationsOpen(false)} />
    </Stack>
  );
}
