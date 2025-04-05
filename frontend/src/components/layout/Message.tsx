import React from 'react';
import { Alert, AlertProps, Box } from '@mui/material';

interface MessageProps extends Omit<AlertProps, 'children'> {
  children: React.ReactNode;
  severity?: 'error' | 'warning' | 'info' | 'success';
}

const Message: React.FC<MessageProps> = ({
  children,
  severity = 'info',
  ...props
}) => {
  return (
    <Box my={2}>
      <Alert severity={severity} variant="outlined" {...props}>
        {children}
      </Alert>
    </Box>
  );
};

export default Message; 