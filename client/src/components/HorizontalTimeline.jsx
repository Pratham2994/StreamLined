import React from 'react';
import { Box, Typography } from '@mui/material';

const HorizontalTimeline = ({ tracking, createdAt }) => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'flex-start', 
        overflowX: 'auto', 
        p: 1 
      }}
    >
      {tracking.map((step, index) => {
        const plannedDate = step.plannedDate ? new Date(step.plannedDate) : null;
        const actualDate = step.actualDate ? new Date(step.actualDate) : null;

        // Always treat "Order Placed" as completed (blue), or use actualDate if present
        const isCompleted = step.stage === 'Order Placed' || !!actualDate;

        return (
          <React.Fragment key={index}>
            {/* Dot + Stage Info */}
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                minWidth: 80
              }}
            >
              {/* Dot */}
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: isCompleted ? 'blue' : 'gray',
                  mb: 1
                }}
              />
              {/* Stage Name & Dates */}
              <Typography variant="body2" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                {step.stage}
              </Typography>
              {step.stage === 'Order Placed' ? (
                <Typography variant="caption" sx={{ textAlign: 'center' }}>
                  Order Placed on {new Date(createdAt).toLocaleDateString()}
                </Typography>
              ) : (
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" display="block">
                    Planned: {plannedDate ? plannedDate.toLocaleDateString() : 'N/A'}
                  </Typography>
                  <Typography variant="caption" display="block">
                    Actual: {actualDate ? actualDate.toLocaleDateString() : 'N/A'}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Horizontal Line (except after last dot) */}
            {index < tracking.length - 1 && (
              <Box
                sx={{
                  width: 50,
                  height: 2,
                  backgroundColor: 'gray',
                  alignSelf: 'center',
                  mx: 2,
                  mt: 1
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </Box>
  );
};

export default HorizontalTimeline;
