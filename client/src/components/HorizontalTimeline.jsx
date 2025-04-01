import React from 'react';
import { Box, Typography, Paper, Stepper, Step, StepLabel, StepContent } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import ConstructionIcon from '@mui/icons-material/Construction';
import InventoryIcon from '@mui/icons-material/Inventory';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';

const HorizontalTimeline = ({ tracking, createdAt }) => {
  // Function to get icon based on stage name
  const getStageIcon = (stageName) => {
    switch (stageName.toLowerCase()) {
      case 'order placed':
        return <AssignmentTurnedInIcon />;
      case 'manufacturing':
        return <ConstructionIcon />;
      case 'quality check':
        return <InventoryIcon />;
      case 'shipment':
        return <FlightTakeoffIcon />;
      case 'delivery':
        return <DeliveryDiningIcon />;
      default:
        return <InventoryIcon />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // For desktop/tablet: Horizontal stepper
  const renderHorizontalStepper = () => (
    <Stepper
      activeStep={tracking.findIndex(step => !step.actualDate)}
      alternativeLabel
      sx={{
        overflowX: 'auto',
        p: 2,
        '& .MuiStepConnector-line': {
          minWidth: '40px'
        },
        '& .MuiStepLabel-label': {
          mt: 1,
          fontSize: '0.875rem'
        }
      }}
    >
      {tracking.map((step, index) => (
        <Step key={index} completed={!!step.actualDate}>
          <StepLabel 
            StepIconComponent={(props) => {
              const { completed } = props;
              return completed ? (
                <CheckCircleIcon color="success" />
              ) : (
                <Box sx={{ position: 'relative' }}>
                  {getStageIcon(step.stage)}
                </Box>
              );
            }}
          >
            <Typography variant="body2" fontWeight="bold">{step.stage}</Typography>
            <Typography variant="caption" display="block">
              {step.stage === 'Order Placed' 
                ? formatDate(createdAt)
                : (step.actualDate 
                  ? formatDate(step.actualDate) 
                  : (step.plannedDate 
                    ? `Planned: ${formatDate(step.plannedDate)}`
                    : 'Not scheduled')
                  )
              }
            </Typography>
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  );
  
  // For mobile: Vertical stepper
  const renderVerticalStepper = () => (
    <Stepper
      activeStep={tracking.findIndex(step => !step.actualDate)}
      orientation="vertical"
      sx={{ 
        p: 2,
        display: { xs: 'flex', md: 'none' }
      }}
    >
      {tracking.map((step, index) => (
        <Step key={index} completed={!!step.actualDate}>
          <StepLabel 
            StepIconComponent={(props) => {
              const { completed } = props;
              return completed ? (
                <CheckCircleIcon color="success" />
              ) : (
                <Box sx={{ position: 'relative' }}>
                  {getStageIcon(step.stage)}
                </Box>
              );
            }}
          >
            <Typography variant="body2" fontWeight="bold">{step.stage}</Typography>
          </StepLabel>
          <StepContent>
            {step.stage === 'Order Placed' ? (
              <Typography variant="body2">
                {formatDate(createdAt)}
              </Typography>
            ) : (
              <>
                {step.plannedDate && (
                  <Typography variant="body2">
                    Planned: {formatDate(step.plannedDate)}
                  </Typography>
                )}
                {step.actualDate && (
                  <Typography variant="body2">
                    Completed: {formatDate(step.actualDate)}
                  </Typography>
                )}
              </>
            )}
          </StepContent>
        </Step>
      ))}
    </Stepper>
  );

  // If no tracking data is available
  if (!tracking || tracking.length === 0) {
    return (
      <Paper elevation={1} sx={{ p: 3, backgroundColor: 'rgba(245, 245, 245, 0.9)' }}>
        <Box sx={{ textAlign: 'center' }}>
          <RadioButtonUncheckedIcon sx={{ fontSize: 40, color: 'grey.500', mb: 2 }} />
          <Typography variant="h6">No Tracking Information Available</Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Order tracking information will be updated as your order progresses through our system.
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={1} sx={{ overflow: 'hidden', backgroundColor: 'rgba(245, 245, 245, 0.9)' }}>
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        {renderHorizontalStepper()}
      </Box>
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {renderVerticalStepper()}
      </Box>
    </Paper>
  );
};

export default HorizontalTimeline;
