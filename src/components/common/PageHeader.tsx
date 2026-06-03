import { ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <Box className="page-header">
      <Box>
        <Typography variant="h1">{title}</Typography>
        {subtitle && <Typography color="text.secondary">{subtitle}</Typography>}
      </Box>
      {actions && (
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          {actions}
        </Stack>
      )}
    </Box>
  );
}
