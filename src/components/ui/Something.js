import React from 'react';
import { Slider } from '@mui/material';

const ForegroundControls = ({ setGravity }) => {
  return (
    <div style={{ position: 'absolute', top: '20px', left: '20px', width: "200px", zIndex: 1 }}>
        <Slider 
            defaultValue={0} 
            min={0} 
            max={3} 
            step={0.01}
            onChange={(e) => {
                setGravity(e.target.value);
            }}
        />
    </div>
  );
}

export default ForegroundControls;