import React from 'react';
import MyVisualBackground from './components/background/MyVisualBackground';
import ForegroundControls from './components/ui/Something';
import { useState } from 'react';

function App() {
  const [gravity, setGravity] = useState(0);
  
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <MyVisualBackground gravity={gravity}/>
      <ForegroundControls setGravity={setGravity}/>
      {/* Other foreground components */}
    </div>
  );
}

export default App;
