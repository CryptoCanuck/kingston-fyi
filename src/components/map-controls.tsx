"use client";

import React from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Locate, 
  Layers, 
  RotateCcw,
  Maximize2
} from 'lucide-react';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onLocate: () => void;
  onReset: () => void;
  onFullscreen: () => void;
  onToggleStyle: () => void;
  isFullscreen: boolean;
}

export function MapControls({
  onZoomIn,
  onZoomOut,
  onLocate,
  onReset,
  onFullscreen,
  onToggleStyle,
  isFullscreen
}: MapControlsProps) {
  return (
    <div className="absolute bottom-6 right-6 z-10 flex flex-col space-y-2">
      {/* Zoom Controls */}
      <div className="glass-effect rounded-lg p-1">
        <button
          onClick={onZoomIn}
          className="block p-3 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-all"
          title="Zoom In"
        >
          <ZoomIn className="h-5 w-5" />
        </button>
        <button
          onClick={onZoomOut}
          className="block p-3 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-all"
          title="Zoom Out"
        >
          <ZoomOut className="h-5 w-5" />
        </button>
      </div>

      {/* Action Controls */}
      <div className="glass-effect rounded-lg p-1">
        <button
          onClick={onLocate}
          className="block p-3 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-all"
          title="Find My Location"
        >
          <Locate className="h-5 w-5" />
        </button>
        <button
          onClick={onReset}
          className="block p-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-all"
          title="Reset View"
        >
          <RotateCcw className="h-5 w-5" />
        </button>
        <button
          onClick={onToggleStyle}
          className="block p-3 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-all"
          title="Toggle Map Style"
        >
          <Layers className="h-5 w-5" />
        </button>
        <button
          onClick={onFullscreen}
          className="block p-3 text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-all"
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          <Maximize2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}