import React from 'react';
import { BarChart3, Users, Zap, Target } from 'lucide-react';

interface StatsPanelProps {
  stats: {
    totalProcessed: number;
    humanAIMatch: number;
    avgConfidence: number;
    accuracyRate: number;
  };
}

export function StatsPanel({ stats }: StatsPanelProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-2">
          <BarChart3 className="text-blue-500" size={24} />
          <span className="text-2xl font-bold text-blue-600">{stats.totalProcessed}</span>
        </div>
        <p className="text-sm text-gray-600">Total Processed</p>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-2">
          <Users className="text-green-500" size={24} />
          <span className="text-2xl font-bold text-green-600">{stats.humanAIMatch}%</span>
        </div>
        <p className="text-sm text-gray-600">Human-AI Match Rate</p>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-2">
          <Zap className="text-orange-500" size={24} />
          <span className="text-2xl font-bold text-orange-600">{stats.avgConfidence}%</span>
        </div>
        <p className="text-sm text-gray-600">Avg AI Confidence</p>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-2">
          <Target className="text-purple-500" size={24} />
          <span className="text-2xl font-bold text-purple-600">{stats.accuracyRate}%</span>
        </div>
        <p className="text-sm text-gray-600">System Accuracy</p>
      </div>
    </div>
  );
}
