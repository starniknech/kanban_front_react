import { Button, Dialog, DialogActions, DialogContent, DialogTitle, List, ListItem, Stack, Typography } from '@mui/material';
import { useEffect } from 'react';
import { useInvitationsStore } from '../store/invitationsStore';
import { useNotificationStore } from '../store/notificationStore';
import { useProjectsStore } from '../store/projectsStore';
import { getEntityId } from '../utils/entity';
import { getErrorMessage } from '../utils/errors';

export function InvitationsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const invitations = useInvitationsStore((state) => state.invitations);
  const fetchMyInvitations = useInvitationsStore((state) => state.fetchMyInvitations);
  const markUnreadInvitationsRead = useInvitationsStore((state) => state.markUnreadInvitationsRead);
  const acceptInvitation = useInvitationsStore((state) => state.acceptInvitation);
  const declineInvitation = useInvitationsStore((state) => state.declineInvitation);
  const fetchProjects = useProjectsStore((state) => state.fetchProjects);
  const showError = useNotificationStore((state) => state.showError);

  useEffect(() => {
    if (open) {
      fetchMyInvitations()
        .then(() => markUnreadInvitationsRead())
        .catch(() => undefined);
    }
  }, [fetchMyInvitations, markUnreadInvitationsRead, open]);

  const handleAccept = async (invitationId: string) => {
    try {
      await acceptInvitation(invitationId);
      await fetchProjects();
    } catch (error) {
      showError(getErrorMessage(error, 'Failed to accept invitation'));
    }
  };

  const handleDecline = async (invitationId: string) => {
    try {
      await declineInvitation(invitationId);
    } catch (error) {
      showError(getErrorMessage(error, 'Failed to decline invitation'));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Invitations</DialogTitle>
      <DialogContent>
        {invitations.length === 0 ? (
          <Typography color="text.secondary">No pending invitations.</Typography>
        ) : (
          <List disablePadding>
            {invitations.map((invitation) => {
              const invitationId = getEntityId(invitation);
              return (
                <ListItem key={invitationId} className="list-row">
                  <Stack spacing={0.5} sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 700 }}>{invitation.email}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Role: {invitation.role}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Button variant="contained" onClick={() => handleAccept(invitationId)}>Accept</Button>
                    <Button variant="outlined" onClick={() => handleDecline(invitationId)}>Decline</Button>
                  </Stack>
                </ListItem>
              );
            })}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
