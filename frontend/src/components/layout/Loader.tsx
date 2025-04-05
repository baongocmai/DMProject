import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoaderProps {
  size?: number;
  text?: string;
}

const Loader: React.FC<LoaderProps> = ({ size = 100, text = 'Đang tải...' }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="200px"
    >
      <CircularProgress size={size} color="primary" />
      {text && (
        <Typography variant="h6" style={{ marginTop: 16 }}>
          {text}
        </Typography>
      )}
    </Box>
  );
};

export default Loader; 