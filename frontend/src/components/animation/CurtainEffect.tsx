import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';

interface CurtainEffectProps {
  onAnimationComplete?: () => void;
}

const CurtainEffect: React.FC<CurtainEffectProps> = ({ onAnimationComplete }) => {
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    // Set a timeout to complete the animation
    const timer = setTimeout(() => {
      setAnimationComplete(true);
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    }, 3000); // Animation duration increased for better visibility

    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: animationComplete ? 'none' : 'flex',
        overflow: 'hidden',
      }}
    >
      {/* Left curtain */}
      <Box
        sx={{
          width: '50%',
          height: '100%',
          backgroundColor: '#B84C63',
          position: 'absolute',
          left: 0,
          animation: 'curtainLeft 2.5s ease-in-out forwards',
          '@keyframes curtainLeft': {
            '0%': {
              transform: 'translateX(0%)',
            },
            '100%': {
              transform: 'translateX(-100%)',
            },
          },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingRight: '20px',
        }}
      >
        {/* Optional decorative element */}
        <Box
          sx={{
            width: '50px',
            height: '100px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: '25px',
          }}
        />
      </Box>
      
      {/* Right curtain */}
      <Box
        sx={{
          width: '50%',
          height: '100%',
          backgroundColor: '#B84C63',
          position: 'absolute',
          right: 0,
          animation: 'curtainRight 2.5s ease-in-out forwards',
          '@keyframes curtainRight': {
            '0%': {
              transform: 'translateX(0%)',
            },
            '100%': {
              transform: 'translateX(100%)',
            },
          },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingLeft: '20px',
        }}
      >
        {/* Optional decorative element */}
        <Box
          sx={{
            width: '50px',
            height: '100px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: '25px',
          }}
        />
      </Box>
      
      {/* Logo in the middle */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10000,
          animation: 'logoAnimation 2.5s ease-in-out forwards',
          '@keyframes logoAnimation': {
            '0%': {
              opacity: 0,
              transform: 'translate(-50%, -50%) scale(0.8)',
            },
            '20%': {
              opacity: 1,
              transform: 'translate(-50%, -50%) scale(1.1)',
            },
            '30%': {
              transform: 'translate(-50%, -50%) scale(1)',
            },
            '80%': {
              opacity: 1,
              transform: 'translate(-50%, -50%) rotate(0deg)',
            },
            '100%': {
              opacity: 0,
              transform: 'translate(-50%, -50%) rotate(360deg) scale(0.5)',
            },
          },
          width: '150px',
          height: '150px',
          bgcolor: 'white',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        }}
      >
        <ShoppingBasketIcon 
          sx={{ 
            fontSize: 80, 
            color: '#B84C63',
            animation: 'basketPulse 2s ease-in-out infinite',
            '@keyframes basketPulse': {
              '0%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.1)' },
              '100%': { transform: 'scale(1)' },
            }
          }} 
        />
      </Box>
    </Box>
  );
};

export default CurtainEffect;

// Add an empty export to make TypeScript consider this a module
export {}; 