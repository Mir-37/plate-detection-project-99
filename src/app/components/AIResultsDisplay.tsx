import React from 'react';
import { Brain, TrendingUp, FileText, CheckCircle, XCircle } from 'lucide-react';
import { BoundingBoxViewer } from './BoundingBoxViewer';

interface AIResult {
  verdict: 'Authentic' | 'Manipulated';
  confidence: number;
  reasoning: string;
  plateText?: string;
  bbox?: [number, number, number, number];
}

interface AIResultsDisplayProps {
  imageSrc: string;
  aiResult: AIResult;
  humanVerdict: 'authentic' | 'manipulated';
}

export function AIResultsDisplay({ imageSrc, aiResult, humanVerdict }: AIResultsDisplayProps) {
  const isMatch = 
    (aiResult.verdict === 'Authentic' && humanVerdict === 'authentic') ||
    (aiResult.verdict === 'Manipulated' && humanVerdict === 'manipulated');

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="text-purple-500" size={28} />
        <h2 className="text-2xl">AI Analysis Results</h2>
      </div>

      {/* Comparison Banner */}
      <div
        className={`mb-6 p-4 rounded-lg ${
          isMatch ? 'bg-green-50 border-2 border-green-300' : 'bg-orange-50 border-2 border-orange-300'
        }`}
      >
        <div className="flex items-center gap-2">
          {isMatch ? (
            <CheckCircle className="text-green-600" size={24} />
          ) : (
            <XCircle className="text-orange-600" size={24} />
          )}
          <div>
            <p className="font-semibold">
              {isMatch ? 'Human and AI verdicts match! ✓' : 'Human and AI verdicts differ ⚠️'}
            </p>
            <p className="text-sm text-gray-600">
              Human: <span className="font-medium capitalize">{humanVerdict}</span> | AI:{' '}
              <span className="font-medium">{aiResult.verdict}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Image with Bounding Box */}
      <div className="mb-6">
        <BoundingBoxViewer imageSrc={imageSrc} bbox={aiResult.bbox} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Verdict Card */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            {aiResult.verdict === 'Authentic' ? (
              <CheckCircle className="text-green-500" size={20} />
            ) : (
              <XCircle className="text-red-500" size={20} />
            )}
            <h3 className="font-semibold">Verdict</h3>
          </div>
          <p
            className={`text-2xl font-bold ${
              aiResult.verdict === 'Authentic' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {aiResult.verdict}
          </p>
        </div>

        {/* Confidence Score */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="text-blue-500" size={20} />
            <h3 className="font-semibold">Confidence Score</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-blue-600">{aiResult.confidence.toFixed(1)}%</p>
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${aiResult.confidence}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Plate Text */}
      {aiResult.plateText && (
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Detected Plate Text</h3>
          <p className="text-xl font-mono bg-white p-3 rounded border-2 border-gray-300 text-center">
            {aiResult.plateText}
          </p>
        </div>
      )}

      {/* AI Reasoning (Chain of Thought) */}
      <div className="bg-purple-50 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="text-purple-600" size={20} />
          <h3 className="font-semibold">AI Reasoning (Chain of Thought)</h3>
        </div>
        <div className="bg-white p-4 rounded border-2 border-purple-200 max-h-64 overflow-y-auto">
          <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
            {aiResult.reasoning}
          </pre>
        </div>
      </div>
    </div>
  );
}