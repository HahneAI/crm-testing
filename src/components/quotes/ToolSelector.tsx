import React from 'react';
import { AITool } from '../../types/ai';

export const ToolSelector: React.FC<{
  availableTools: AITool[];
  selectedTool: string;
  onToolSelect: (tool: string) => void;
}> = ({ availableTools, selectedTool, onToolSelect }) => {
  return (
    <div className="flex space-x-2">
      {availableTools.map(tool => (
        <button
          key={tool.id}
          onClick={() => onToolSelect(tool.id)}
          className={`p-2 rounded ${selectedTool === tool.id ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          {tool.name}
        </button>
      ))}
    </div>
  );
};
