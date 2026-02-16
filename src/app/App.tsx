import React, { useState } from 'react';
import { Header } from './components/Header';
import { StatsPanel } from './components/StatsPanel';
import { ImageUpload } from './components/ImageUpload';
import { HumanVerification } from './components/HumanVerification';
import { AIResultsDisplay } from './components/AIResultsDisplay';
import { TrainingPanel } from './components/TrainingPanel';
import { DatasetGenerator } from './components/DatasetGenerator';
import { RefreshCw, FlaskConical, ScanSearch } from 'lucide-react';
import { fileSystemService } from './services/FileSystemService';

// Mock AI response generator
const generateMockAIResponse = () => {
  const isManipulated = Math.random() > 0.5;
  
  return {
    verdict: isManipulated ? 'Manipulated' as const : 'Authentic' as const,
    confidence: Math.random() * 30 + 70, // 70-100% confidence
    reasoning: isManipulated 
      ? `Step 1: Analyzing character spacing and kerning patterns...
  - Detected inconsistent spacing between characters 'A' and 'B' (3.2px vs expected 2.8px)
  - Font baseline alignment shows 0.4px vertical deviation

Step 2: Examining texture and compression artifacts...
  - JPEG compression pattern analysis reveals block boundaries around character edges
  - Micro-texture analysis shows smoothness gradient inconsistent with natural weathering

Step 3: Evaluating lighting and shadow consistency...
  - Shadow direction for plate differs from vehicle body shadows by ~15°
  - Specular highlights on plate surface don't match ambient light source

Step 4: Cross-referencing with authentic plate database...
  - Font metrics match 89% with standard DMV templates
  - Color histogram shows unusual RGB distribution in character regions (deviation: 12%)

Conclusion: Multiple visual artifacts suggest digital manipulation. High confidence in MANIPULATED verdict.`
      : `Step 1: Analyzing character spacing and kerning patterns...
  - Character spacing follows standard DMV typography (consistent 2.8px kerning)
  - Font baseline alignment within normal variance (±0.1px)

Step 2: Examining texture and compression artifacts...
  - Natural JPEG compression consistent with camera sensor noise
  - Micro-texture shows authentic weathering patterns (dust, minor scratches)

Step 3: Evaluating lighting and shadow consistency...
  - Shadow direction matches environmental lighting (within 3° tolerance)
  - Specular highlights correlate with natural ambient light source

Step 4: Cross-referencing with authentic plate database...
  - Font metrics match 98% with standard DMV templates
  - Color histogram within expected range for authentic plates

Conclusion: No evidence of digital manipulation detected. High confidence in AUTHENTIC verdict.`,
    plateText: `ABC-${Math.floor(Math.random() * 9000 + 1000)}`,
    bbox: [200, 300, 800, 600] as [number, number, number, number], // Normalized 0-1000
  };
};

export default function App() {
  const [mode, setMode] = useState<'verification' | 'training'>('verification');
  const [uploadedImage, setUploadedImage] = useState<string>('');
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [step, setStep] = useState<'upload' | 'verify' | 'results'>('upload');
  const [humanAiScore, setHumanAiScore] = useState<number>(5.0);
  const [aiResult, setAIResult] = useState<any>(null);
  const [stats, setStats] = useState({
    totalProcessed: 0,
    humanAIMatch: 0,
    avgConfidence: 0,
    accuracyRate: 0,
  });
  const [isWorkspaceReady, setIsWorkspaceReady] = useState(fileSystemService.isReady());

  const handleSelectDirectory = async () => {
    const success = await fileSystemService.selectDirectory();
    setIsWorkspaceReady(success);
  };

  const handleImageSelect = (file: File, preview: string) => {
    setCurrentFile(file);
    setUploadedImage(preview);
    setStep('verify');
  };

  const handleHumanVerification = (aiScore: number) => {
    setHumanAiScore(aiScore);
    
    // Derive verdict from score: > 5.5 = manipulated, <= 5.5 = authentic
    const humanVerdict = aiScore > 5.5 ? 'manipulated' : 'authentic';
    
    // Simulate AI processing
    setTimeout(() => {
      const mockResult = generateMockAIResponse();
      setAIResult(mockResult);
      
      // Update stats
      const isMatch = 
        (mockResult.verdict === 'Authentic' && humanVerdict === 'authentic') ||
        (mockResult.verdict === 'Manipulated' && humanVerdict === 'manipulated');
      
      setStats(prev => {
        const newTotal = prev.totalProcessed + 1;
        const newMatches = prev.humanAIMatch * prev.totalProcessed / 100 + (isMatch ? 1 : 0);
        const newMatchRate = newTotal > 0 ? (newMatches / newTotal) * 100 : 0;
        const newAvgConf = ((prev.avgConfidence * prev.totalProcessed) + mockResult.confidence) / newTotal;
        
        return {
          totalProcessed: newTotal,
          humanAIMatch: Math.round(newMatchRate),
          avgConfidence: Math.round(newAvgConf),
          accuracyRate: Math.round(newMatchRate), // In real app, this would be actual ground truth
        };
      });
      
      setStep('results');
      
      // Auto-save to workspace if available
      if (fileSystemService.isReady()) {
        fileSystemService.saveVerification({
          ...mockResult,
          humanVerdict,
          humanAiScore,
          timestamp: Date.now()
        }, currentFile).catch(err => console.error('Auto-save failed:', err));
      }
    }, 1500);
  };

  const handleReset = () => {
    setUploadedImage('');
    setCurrentFile(null);
    setStep('upload');
    setHumanAiScore(5.0);
    setAIResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onSelectDirectory={handleSelectDirectory}
        isWorkspaceReady={isWorkspaceReady}
      />
      
      <main className="container mx-auto px-6 py-8">
        {/* Mode Selector */}
        <div className="flex gap-4 mb-6 max-w-5xl mx-auto">
          <button
            onClick={() => setMode('verification')}
            className={`flex-1 py-4 px-6 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
              mode === 'verification'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
            }`}
          >
            <ScanSearch size={24} />
            Verification Mode
          </button>
          
          <button
            onClick={() => setMode('training')}
            className={`flex-1 py-4 px-6 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
              mode === 'training'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
            }`}
          >
            <FlaskConical size={24} />
            Dataset Generator & Validator
          </button>
        </div>

        {mode === 'verification' && (
          <>
            <StatsPanel stats={stats} />
            
            <div className="max-w-5xl mx-auto">
              {step === 'upload' && (
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-2xl font-bold mb-6">Step 1: Upload License Plate Image</h2>
                  <ImageUpload
                    onImageSelect={handleImageSelect}
                    currentImage={uploadedImage}
                    onClear={handleReset}
                  />
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Instructions:</strong> Upload a license plate image to begin the forensic verification process.
                      The system will ask for your human judgment before revealing the AI analysis.
                    </p>
                  </div>
                </div>
              )}

              {step === 'verify' && uploadedImage && (
                <HumanVerification
                  imageSrc={uploadedImage}
                  onSubmit={handleHumanVerification}
                />
              )}

              {step === 'results' && aiResult && uploadedImage && (
                <div>
                  <AIResultsDisplay
                    imageSrc={uploadedImage}
                    aiResult={aiResult}
                    humanVerdict={humanAiScore > 5.5 ? 'manipulated' : 'authentic'}
                  />
                  
                  {/* Human AI Score Display */}
                  <div className="mt-4 bg-white rounded-lg shadow-lg p-6">
                    <h3 className="font-semibold mb-4 text-lg">Your Human Rating</h3>
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg border-2 border-blue-200">
                      <div className="text-center mb-4">
                        <div className={`text-5xl font-bold mb-2 ${
                          humanAiScore <= 3 ? 'text-green-600' :
                          humanAiScore <= 5 ? 'text-yellow-600' :
                          humanAiScore <= 7 ? 'text-orange-600' :
                          'text-red-600'
                        }`}>
                          {humanAiScore.toFixed(1)} / 10.0
                        </div>
                        <p className="text-gray-600">
                          {humanAiScore <= 2.5 && "You rated this as Definitely Real"}
                          {humanAiScore > 2.5 && humanAiScore <= 4.5 && "You rated this as Probably Real"}
                          {humanAiScore > 4.5 && humanAiScore <= 5.5 && "You were Uncertain"}
                          {humanAiScore > 5.5 && humanAiScore <= 7.5 && "You rated this as Probably AI-Generated"}
                          {humanAiScore > 7.5 && "You rated this as Definitely AI-Generated"}
                        </p>
                      </div>
                      <div className="relative h-4 bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 rounded-full">
                        <div
                          className="absolute top-1/2 -translate-y-1/2 w-1 h-8 bg-white border-2 border-gray-800 rounded"
                          style={{ left: `${((humanAiScore - 1) / 9) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleReset}
                    className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={20} />
                    Verify Another License Plate
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {mode === 'training' && (
          <div className="max-w-6xl mx-auto mt-12">
            <DatasetGenerator isWorkspaceReady={isWorkspaceReady}  />
            <br />
            <div className="mt-12">
              <TrainingPanel/>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-gray-800 text-white py-6 mt-12">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm">
            North South University - Department of Electrical & Computer Engineering
          </p>
          <p className="text-xs text-gray-400 mt-2">
            CSE299 Junior Design | Section 6 | Supervised by Dr. Md Adnan Arefeen (AFE)
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Team: Mir Mutasim Hossain (2232536042), Md. Nafis Fuad (2311934042), Shahriar Swanon (2231540642)
          </p>
        </div>
      </footer>
    </div>
  );
}