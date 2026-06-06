import { Badge, Box, Chip, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import MailIcon from '@mui/icons-material/Mail';
import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { EmptyState } from '../components/common/EmptyState';
import { PageHeader } from '../components/common/PageHeader';
import { useUserSocket } from '../hooks/socket/useUserSocket';
import { CreateProjectModal } from '../modals/CreateProjectModal';
import { InvitationsModal } from '../modals/InvitationsModal';
import { useAuthStore } from '../store/authStore';
import { useInvitationsStore } from '../store/invitationsStore';
import { useNotificationStore } from '../store/notificationStore';
import { useProjectsStore } from '../store/projectsStore';
import { InvitationStatus, NotificationStatus } from '../types/domain';
import { getEntityId } from '../utils/entity';
import { getErrorMessage } from '../utils/errors';

export function DashboardPage() {
  const projects = useProjectsStore((state) => state.projects);
  const fetchProjects = useProjectsStore((state) => state.fetchProjects);
  const createProject = useProjectsStore((state) => state.createProject);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const invitations = useInvitationsStore((state) => state.invitations);
  const fetchMyInvitations = useInvitationsStore((state) => state.fetchMyInvitations);
  const showError = useNotificationStore((state) => state.showError);
  const [createOpen, setCreateOpen] = useState(false);
  const [invitationsOpen, setInvitationsOpen] = useState(false);
  useUserSocket(isAuthenticated);

  const describedProjectsCount = useMemo(
    () => projects.filter((project) => Boolean(project.description?.trim())).length,
    [projects],
  );

  const latestProject = useMemo(() => {
    return [...projects].sort((a, b) => {
      const firstDate = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const secondDate = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return secondDate - firstDate;
    })[0];
  }, [projects]);

  const unreadInvitationsCount = useMemo(
    () =>
      invitations.filter(
        (invitation) =>
          invitation.status === InvitationStatus.PENDING &&
          invitation.notificationStatus === NotificationStatus.UNREAD,
      ).length,
    [invitations],
  );

  useEffect(() => {
    fetchProjects();
    fetchMyInvitations().catch((error) => {
      showError(getErrorMessage(error, 'Failed to load invitations'));
    });
  }, [fetchMyInvitations, fetchProjects, showError]);

  return (
    <Stack spacing={3} className="dashboard-page">
      <PageHeader
        title="Dashboard"
        subtitle="Your active workspaces and collaboration entry point."
        actions={(
          <>
            <Tooltip title="Invitations">
              <IconButton className="round-action" color="primary" onClick={() => setInvitationsOpen(true)}>
                <Badge badgeContent={unreadInvitationsCount} color="error">
                  <MailIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title="Create project">
              <IconButton className="round-action round-action--contained" color="primary" onClick={() => setCreateOpen(true)}>
                <AddIcon />
              </IconButton>
            </Tooltip>
          </>
        )}
      />

      <Box className="dashboard-overview">
        <Paper variant="outlined" className="dashboard-overview__main">
          <Stack spacing={1.5}>
            <Chip icon={<FolderOpenIcon />} label="Workspace overview" className="dashboard-kicker" />
            <Typography variant="h2">Keep every project one click away.</Typography>
            <Typography color="text.secondary">
              Review your spaces, jump back into ongoing work, or accept an invitation from your team.
            </Typography>
          </Stack>
        </Paper>

        <Box className="dashboard-stats">
          <Paper variant="outlined" className="dashboard-stat">
            <Typography className="dashboard-stat__value">{projects.length}</Typography>
            <Typography color="text.secondary">Projects</Typography>
          </Paper>
          <Paper variant="outlined" className="dashboard-stat">
            <Typography className="dashboard-stat__value">{describedProjectsCount}</Typography>
            <Typography color="text.secondary">Documented</Typography>
          </Paper>
          <Paper variant="outlined" className="dashboard-stat dashboard-stat--wide">
            <Typography className="dashboard-stat__label" color="text.secondary">Latest activity</Typography>
            <Typography className="dashboard-stat__name">
              {latestProject?.name || 'Nothing yet'}
            </Typography>
          </Paper>
        </Box>
      </Box>

      {projects.length === 0 ? (
        <EmptyState title="No projects yet" text="Create your first project or accept an invitation." />
      ) : (
        <Box className="project-grid">
          {projects.map((project, index) => {
            const projectId = getEntityId(project);
            return (
              <Paper
                key={projectId}
                component={Link}
                to={'/project/' + projectId}
                variant="outlined"
                className="project-card"
                data-accent={index % 3}
              >
                <Stack spacing={2} className="project-card__content">
                  <Box className="project-card__topline">
                    <span className="project-card__icon">
                      <FolderOpenIcon fontSize="small" />
                    </span>
                    <ArrowForwardIcon className="project-card__arrow" fontSize="small" />
                  </Box>
                  <Stack spacing={0.75}>
                    <Typography variant="h3" className="project-card__title">{project.name}</Typography>
                    <Typography color="text.secondary" className="project-card__description">
                      {project.description || 'No description added yet.'}
                    </Typography>
                  </Stack>
                </Stack>
              </Paper>
            );
          })}
        </Box>
      )}

      <CreateProjectModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={async (payload) => {
          try {
            await createProject(payload);
          } catch (error) {
            showError(getErrorMessage(error, 'Failed to create project'));
            throw error;
          }
        }}
      />
      <InvitationsModal open={invitationsOpen} onClose={() => setInvitationsOpen(false)} />
    </Stack>
  );
}
