import React, { useState } from 'react';
import { AlertTriangle, Sliders } from 'lucide-react';

interface HumanVerificationProps {
  imageSrc: string;
  onSubmit: (aiScore: number) => void;
  disabled?: boolean;
}

export function HumanVerification({ imageSrc, onSubmit, disabled }: HumanVerificationProps) {
  const [aiScore, setAiScore] = useState<number>(5.0);

  const handleSubmit = () => {
    onSubmit(aiScore);
  };

  const getScoreLabel = () => {
    if (aiScore <= 2.5) return "Definitely Real";
    if (aiScore <= 4.5) return "Probably Real";
    if (aiScore <= 5.5) return "Uncertain";
    if (aiScore <= 7.5) return "Probably AI-Generated";
    return "Definitely AI-Generated";
  };

  const getScoreColor = () => {
    if (aiScore <= 3) return "text-green-600";
    if (aiScore <= 5) return "text-yellow-600";
    if (aiScore <= 7) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="text-orange-500" size={24} />
        <h2 className="text-xl">Human Verification Required</h2>
      </div>
      
      <p className="text-gray-600 mb-6">
        Please review the license plate image and rate how AI-generated it appears on a scale from 1.0 to 10.0.
      </p>

      <div className="mb-8">
        <img
          src={imageSrc}
          alt="License plate for verification"
          className="w-full max-w-2xl mx-auto rounded-lg shadow-md"
        />
      </div>

      {/* AI Detection Rating Slider */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-lg border-2 border-blue-200">
        <div className="flex items-center gap-2 mb-4">
          <Sliders className="text-blue-600" size={24} />
          <h3 className="text-lg font-semibold">How AI-Generated Does This Look?</h3>
        </div>
        
        {/* Current Score Display */}
        <div className="text-center mb-6">
          <div className={`text-6xl font-bold ${getScoreColor()} mb-2`}>
            {aiScore.toFixed(1)}
          </div>
          <p className={`text-xl font-semibold ${getScoreColor()}`}>
            {getScoreLabel()}
          </p>
        </div>
        
        {/* Slider */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="range"
              min="1"
              max="10"
              step="0.1"
              value={aiScore}
              onChange={(e) => setAiScore(parseFloat(e.target.value))}
              disabled={disabled}
              className="w-full h-4 rounded-lg appearance-none cursor-pointer slider-custom"
            />
          </div>
          
          <div className="flex justify-between mt-3 text-sm font-medium">
            <span className="text-green-600">1.0 - Real</span>
            <span className="text-yellow-600">5.0 - Neutral</span>
            <span className="text-red-600">10.0 - AI</span>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={disabled}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
        >
          Submit Rating
        </button>
      </div>
    </div>
  );
}