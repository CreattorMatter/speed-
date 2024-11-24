import React, { useState } from 'react';
import Toolbar from './Toolbar';
import Canvas from './Canvas';
import ToolPanel from './ToolPanel';

type Tab = 'elements' | 'product' | 'history';

export default function Builder() {
  const [activeTab, setActiveTab] = useState<Tab>('elements');

  return (
    <div className="h-screen flex flex-col">
      <Toolbar />
      <div className="flex-1 flex overflow-hidden">
        <Canvas />
        <ToolPanel activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
}