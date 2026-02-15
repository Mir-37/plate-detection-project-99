import React from 'react';
import { Shield, Database, FolderOpen } from 'lucide-react';

interface HeaderProps {
  onSelectDirectory?: () => void;
  isWorkspaceReady?: boolean;
}

export function Header({ onSelectDirectory, isWorkspaceReady = false }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Shield size={36} />
            <div>
              <h1 className="text-3xl font-bold">
                License Plate Forensic Verification System
              </h1>
              <p className="text-blue-100 text-sm mt-1">
                Multi-modal AI Detection with Human-in-the-Loop Feedback
              </p>
            </div>
          </div>
          
          {onSelectDirectory && (
            <button 
              onClick={onSelectDirectory}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                isWorkspaceReady 
                  ? 'bg-green-500/20 text-green-100 hover:bg-green-500/30 ring-1 ring-green-400/50' 
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              <FolderOpen size={20} />
              {isWorkspaceReady ? 'Workspace Active' : 'Select Storage Folder'}
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <Database size={16} />
            <span>Qwen3-VL-4B-Thinking Model</span>
          </div>
          <div className="bg-white/20 px-3 py-1 rounded">
            NSU CSE299 - Junior Design Project
          </div>
        </div>
      </div>
    </header>
  );
}
