import { Paper, Typography } from '@mui/material';

export function EmptyState({ title, text }: { title: string; text?: string }) {
  return (
    <Paper variant="outlined" className="empty-state">
      <Typography variant="h3">{title}</Typography>
      {text && <Typography color="text.secondary">{text}</Typography>}
    </Paper>
  );
}
