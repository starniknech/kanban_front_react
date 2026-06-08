import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, List, ListItem, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useInvitationsStore } from '../store/invitationsStore';
import { useProjectsStore } from '../store/projectsStore';
import { InvitationRole, InvitationStatus, ProjectRole, UserProject } from '../types/domain';
import { getEntityId, getMemberUser, getMemberUserId, hasRole } from '../utils/entity';

interface InviteForm {
  email: string;
  role: InvitationRole;
}

export function CollaboratorsModal({
  open,
  onClose,
  projectId,
  currentMembership,
}: {
  open: boolean;
  onClose: () => void;
  projectId: string;
  currentMembership?: UserProject;
}) {
  const members = useProjectsStore((state) => state.members);
  const fetchMembers = useProjectsStore((state) => state.fetchMembers);
  const updateMemberRoles = useProjectsStore((state) => state.updateMemberRoles);
  const removeMember = useProjectsStore((state) => state.removeMember);
  const projectInvitations = useInvitationsStore((state) => state.projectInvitations);
  const fetchProjectInvitations = useInvitationsStore((state) => state.fetchProjectInvitations);
  const createInvitation = useInvitationsStore((state) => state.createInvitation);
  const cancelInvitation = useInvitationsStore((state) => state.cancelInvitation);
  const { register, handleSubmit, reset, formState } = useForm<InviteForm>({
    defaultValues: { role: InvitationRole.MEMBER },
  });

  const isOwner = hasRole(currentMembership?.role, ProjectRole.OWNER);
  const isAdmin = hasRole(currentMembership?.role, ProjectRole.ADMIN);
  const pendingProjectInvitations = useMemo(
    () => projectInvitations.filter((invitation) => invitation.status === InvitationStatus.PENDING),
    [projectInvitations],
  );

  useEffect(() => {
    if (open) {
      fetchMembers(projectId);
      if (isAdmin) fetchProjectInvitations(projectId);
    }
  }, [fetchMembers, fetchProjectInvitations, isAdmin, open, projectId]);

  const submitInvite = handleSubmit(async (payload) => {
    await createInvitation(projectId, payload);
    reset({ role: InvitationRole.MEMBER, email: '' });
  });

  const handleRoleChange = async (memberId: string, value: string) => {
    const roles = value === ProjectRole.ADMIN
      ? [ProjectRole.MEMBER, ProjectRole.ADMIN]
      : [ProjectRole.MEMBER];
    await updateMemberRoles(projectId, memberId, roles);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Collaborators</DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          <List disablePadding>
            {members.map((member) => {
              const user = getMemberUser(member);
              const memberId = getMemberUserId(member);
              const memberRole = hasRole(member.role, ProjectRole.OWNER)
                ? ProjectRole.OWNER
                : hasRole(member.role, ProjectRole.ADMIN)
                  ? ProjectRole.ADMIN
                  : ProjectRole.MEMBER;

              return (
                <ListItem key={memberId} className="list-row">
                  <Stack spacing={0.5} sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 700 }}>{user?.name || memberId}</Typography>
                    <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
                  </Stack>
                  {isOwner && memberRole !== ProjectRole.OWNER ? (
                    <Stack direction="row" spacing={1}>
                      <TextField select size="small" value={memberRole} onChange={(event) => handleRoleChange(memberId, event.target.value)}>
                        <MenuItem value={ProjectRole.MEMBER}>member</MenuItem>
                        <MenuItem value={ProjectRole.ADMIN}>admin</MenuItem>
                      </TextField>
                      <Button color="error" onClick={() => removeMember(projectId, memberId)}>Remove</Button>
                    </Stack>
                  ) : (
                    <Typography>{memberRole}</Typography>
                  )}
                </ListItem>
              );
            })}
          </List>

          {isAdmin && (
            <>
              <Divider />
              <Stack spacing={2}>
                <Typography variant="h3">Invite user</Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <TextField label="Email" fullWidth {...register('email', { required: true })} />
                  <TextField select label="Role" defaultValue={InvitationRole.MEMBER} sx={{ minWidth: 160 }} {...register('role')}>
                    <MenuItem value={InvitationRole.MEMBER}>member</MenuItem>
                    {isOwner && <MenuItem value={InvitationRole.ADMIN}>admin</MenuItem>}
                  </TextField>
                  <Button variant="contained" onClick={submitInvite} disabled={formState.isSubmitting}>Invite</Button>
                </Stack>
              </Stack>

              <Stack spacing={1}>
                <Typography variant="h3">Pending invitations</Typography>
                {pendingProjectInvitations.map((invitation) => {
                  const invitationId = getEntityId(invitation);
                  return (
                    <ListItem key={invitationId} className="list-row">
                      <Typography sx={{ flex: 1 }}>{invitation.email} as {invitation.role}</Typography>
                      <Button onClick={() => cancelInvitation(projectId, invitationId)}>Cancel</Button>
                    </ListItem>
                  );
                })}
              </Stack>
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
