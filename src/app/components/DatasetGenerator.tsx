import React, { useState } from 'react';
import { Upload, Sparkles, Wand2, Settings, Brain, CheckCircle, XCircle, Download, Trash2, FolderInput } from 'lucide-react';
import { fileSystemService } from '../services/FileSystemService';

type GenerationMethod = 'nano-banana' | 'inpainting' | 'rule-based';

interface GeneratedImage {
  id: string;
  originalSrc: string;
  generatedSrc: string;
  method: GenerationMethod;
  qwenVerdict: 'Authentic' | 'Manipulated';
  qwenConfidence: number;
  qwenReasoning: string;
  accepted: boolean | null;
  timestamp: number;
}

const mockQwenEvaluation = (method: GenerationMethod) => {
  // Different methods have different detection rates
  const baseConfidence = {
    'nano-banana': Math.random() * 20 + 75, // 75-95% (hardest to detect)
    'inpainting': Math.random() * 30 + 60, // 60-90%
    'rule-based': Math.random() * 40 + 50, // 50-90% (easiest to detect)
  };

  const isDetected = Math.random() > 0.3; // 70% detection rate
  
  return {
    verdict: isDetected ? 'Manipulated' as const : 'Authentic' as const,
    confidence: baseConfidence[method],
    reasoning: isDetected
      ? `Chain of Thought Analysis:

1. Character Analysis:
   - Font kerning shows slight inconsistency (${(Math.random() * 2 + 1).toFixed(1)}px deviation)
   - Baseline alignment variance detected
   
2. Texture Examination:
   - ${method === 'nano-banana' ? 'Subtle AI generation artifacts in high-frequency details' : ''}
   - ${method === 'inpainting' ? 'Inpainting blend boundaries visible at 8x magnification' : ''}
   - ${method === 'rule-based' ? 'Artificial noise pattern not consistent with camera sensor' : ''}
   
3. Lighting Analysis:
   - Shadow direction inconsistency: ~${Math.floor(Math.random() * 20 + 5)}°
   - Specular highlights don't match ambient lighting
   
4. Compression Artifacts:
   - ${method === 'nano-banana' ? 'GAN-specific compression pattern detected' : 'JPEG blocks show editing traces'}

Conclusion: Multiple indicators suggest MANIPULATION. Confidence: ${baseConfidence[method].toFixed(1)}%`
      : `Chain of Thought Analysis:

1. Character Analysis:
   - Font kerning within normal variance
   - Baseline alignment consistent
   
2. Texture Examination:
   - Natural weathering patterns present
   - Camera noise consistent with sensor characteristics
   
3. Lighting Analysis:
   - Shadow direction matches environment
   - Specular highlights align with light source
   
4. Compression Artifacts:
   - Natural JPEG compression pattern
   - No evidence of digital manipulation

Conclusion: Appears AUTHENTIC. However, ${method === 'nano-banana' ? 'advanced generation techniques can be very convincing' : 'some manipulation traces might be too subtle'}. Confidence: ${baseConfidence[method].toFixed(1)}%`
  };
};

export function DatasetGenerator({ isWorkspaceReady }: { isWorkspaceReady: boolean }) {
  const [originalImage, setOriginalImage] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<GenerationMethod>('nano-banana');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentGenerated, setCurrentGenerated] = useState<GeneratedImage | null>(null);
  const [dataset, setDataset] = useState<GeneratedImage[]>([]);

  const handleOriginalUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOriginalImage(URL.createObjectURL(file));
      setCurrentGenerated(null);
    }
  };

  const handleGenerate = async () => {
    if (!originalImage) return;

    setIsGenerating(true);
    
    // Simulate generation and Qwen evaluation
    setTimeout(() => {
      const qwenEval = mockQwenEvaluation(selectedMethod);
      
      const generated: GeneratedImage = {
        id: Math.random().toString(36).substr(2, 9),
        originalSrc: originalImage,
        generatedSrc: originalImage, // In real app, this would be the generated version
        method: selectedMethod,
        qwenVerdict: qwenEval.verdict,
        qwenConfidence: qwenEval.confidence,
        qwenReasoning: qwenEval.reasoning,
        accepted: null,
        timestamp: Date.now(),
      };
      
      setCurrentGenerated(generated);
      setIsGenerating(false);
    }, 2000);
  };

  const handleAccept = () => {
    if (!currentGenerated) return;
    
    setDataset(prev => [...prev, { ...currentGenerated, accepted: true }]);
    setCurrentGenerated(null);
  };

  const handleReject = () => {
    if (!currentGenerated) return;
    
    setDataset(prev => [...prev, { ...currentGenerated, accepted: false }]);
    setCurrentGenerated(null);
  };

  const handleDelete = (id: string) => {
    setDataset(prev => prev.filter(item => item.id !== id));
  };

  const handleExport = () => {
    const exportData = dataset
      .filter(item => item.accepted)
      .map(item => ({
        method: item.method,
        qwenVerdict: item.qwenVerdict,
        qwenConfidence: item.qwenConfidence,
        timestamp: item.timestamp,
      }));
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `synthetic_dataset_${Date.now()}.json`;
    link.click();
  };

  const handleSaveToWorkspace = async () => {
    try {
      const exportData = dataset
        .filter(item => item.accepted)
        .map(item => ({
          method: item.method,
          qwenVerdict: item.qwenVerdict,
          qwenConfidence: item.qwenConfidence,
          timestamp: item.timestamp,
        }));
      
      await fileSystemService.saveDataset(exportData);
      // Could add a toast notification here
      alert('Dataset saved to workspace successfully!');
    } catch (error) {
      console.error('Failed to save dataset:', error);
      alert('Failed to save dataset. See console for details.');
    }
  };

  const acceptedCount = dataset.filter(d => d.accepted).length;
  const rejectedCount = dataset.filter(d => !d.accepted).length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Synthetic Dataset Generator & Validator</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Accepted Fakes</p>
                <p className="text-3xl font-bold text-green-600">{acceptedCount}</p>
              </div>
              <CheckCircle className="text-green-500" size={40} />
            </div>
          </div>

          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected Fakes</p>
                <p className="text-3xl font-bold text-red-600">{rejectedCount}</p>
              </div>
              <XCircle className="text-red-500" size={40} />
            </div>
          </div>

          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Generated</p>
                <p className="text-3xl font-bold text-blue-600">{dataset.length}</p>
              </div>
              <Sparkles className="text-blue-500" size={40} />
            </div>
          </div>
        </div>

        {acceptedCount > 0 && (
          <button
            onClick={handleExport}
            className="mt-4 w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
          >
            <Download size={20} />
            Export Accepted Dataset ({acceptedCount} images)
          </button>
        )}

        {acceptedCount > 0 && isWorkspaceReady && (
          <button
            onClick={handleSaveToWorkspace}
            className="mt-2 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2"
          >
            <FolderInput size={20} />
            Save to Workspace Folder
          </button>
        )}
      </div>

      {/* Generation Panel */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">Step 1: Upload Real License Plate</h3>
        
        <input
          type="file"
          accept="image/*"
          onChange={handleOriginalUpload}
          className="hidden"
          id="original-upload"
        />
        
        {!originalImage ? (
          <label
            htmlFor="original-upload"
            className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors cursor-pointer bg-gray-50"
          >
            <Upload className="text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 mb-2">Upload a REAL license plate image</p>
            <p className="text-sm text-gray-400">This will be the base for generating fakes</p>
          </label>
        ) : (
          <div className="relative">
            <img
              src={originalImage}
              alt="Original license plate"
              className="w-full max-w-2xl mx-auto rounded-lg shadow-md"
            />
            <button
              onClick={() => {
                setOriginalImage('');
                setCurrentGenerated(null);
              }}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
            >
              <XCircle size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Method Selection */}
      {originalImage && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">Step 2: Choose Generation Method</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button
              onClick={() => setSelectedMethod('nano-banana')}
              className={`p-6 rounded-lg border-2 transition-all ${
                selectedMethod === 'nano-banana'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-300 hover:border-purple-300'
              }`}
            >
              <Sparkles
                className={`mx-auto mb-3 ${
                  selectedMethod === 'nano-banana' ? 'text-purple-600' : 'text-gray-400'
                }`}
                size={40}
              />
              <p className="font-bold text-center mb-2">Nano Banana Pro</p>
              <p className="text-sm text-gray-600 text-center">Gemini 3 Pro Image Generation</p>
              <p className="text-xs text-purple-600 text-center mt-2">Hardest to detect</p>
            </button>

            <button
              onClick={() => setSelectedMethod('inpainting')}
              className={`p-6 rounded-lg border-2 transition-all ${
                selectedMethod === 'inpainting'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-300'
              }`}
            >
              <Wand2
                className={`mx-auto mb-3 ${
                  selectedMethod === 'inpainting' ? 'text-blue-600' : 'text-gray-400'
                }`}
                size={40}
              />
              <p className="font-bold text-center mb-2">AI Inpainting</p>
              <p className="text-sm text-gray-600 text-center">Stable Diffusion Inpainting</p>
              <p className="text-xs text-blue-600 text-center mt-2">Medium difficulty</p>
            </button>

            <button
              onClick={() => setSelectedMethod('rule-based')}
              className={`p-6 rounded-lg border-2 transition-all ${
                selectedMethod === 'rule-based'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-300 hover:border-orange-300'
              }`}
            >
              <Settings
                className={`mx-auto mb-3 ${
                  selectedMethod === 'rule-based' ? 'text-orange-600' : 'text-gray-400'
                }`}
                size={40}
              />
              <p className="font-bold text-center mb-2">Rule-Based</p>
              <p className="text-sm text-gray-600 text-center">OpenCV/PIL Augmentation</p>
              <p className="text-xs text-orange-600 text-center mt-2">Easiest to detect</p>
            </button>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                Generating & Asking Qwen...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Generate Fake & Evaluate with Qwen
              </>
            )}
          </button>
        </div>
      )}

      {/* Qwen Evaluation Results */}
      {currentGenerated && (
        <div className="bg-white rounded-lg shadow-lg p-6 border-4 border-purple-300">
          <div className="flex items-center gap-2 mb-6">
            <Brain className="text-purple-600" size={28} />
            <h3 className="text-xl font-bold">Qwen VLM Evaluation</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm text-gray-600 mb-2">Original (Real)</p>
              <img
                src={currentGenerated.originalSrc}
                alt="Original"
                className="w-full rounded-lg shadow-md"
              />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Generated ({currentGenerated.method === 'nano-banana' ? 'Nano Banana Pro' : 
                          currentGenerated.method === 'inpainting' ? 'AI Inpainting' : 'Rule-Based'})
              </p>
              <img
                src={currentGenerated.generatedSrc}
                alt="Generated"
                className="w-full rounded-lg shadow-md border-4 border-yellow-300"
              />
              <p className="text-xs text-center text-gray-500 mt-2">
                (Mock: Same image shown - real system would show generated version)
              </p>
            </div>
          </div>

          {/* Qwen's Assessment */}
          <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Qwen's Verdict</p>
                <p className={`text-2xl font-bold ${
                  currentGenerated.qwenVerdict === 'Authentic' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {currentGenerated.qwenVerdict}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Confidence</p>
                <p className="text-2xl font-bold text-blue-600">
                  {currentGenerated.qwenConfidence.toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border-2 border-purple-200">
              <p className="text-sm font-semibold mb-2">Qwen's Reasoning:</p>
              <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono max-h-64 overflow-y-auto">
                {currentGenerated.qwenReasoning}
              </pre>
            </div>
          </div>

          {/* Quality Assessment */}
          <div className={`p-4 rounded-lg mb-6 ${
            currentGenerated.qwenVerdict === 'Authentic'
              ? 'bg-green-50 border-2 border-green-300'
              : 'bg-orange-50 border-2 border-orange-300'
          }`}>
            <p className="font-semibold mb-2">
              {currentGenerated.qwenVerdict === 'Authentic'
                ? '✅ High Quality Fake - Qwen thinks it\'s real!'
                : '⚠️ Detectable Fake - Qwen caught the manipulation'}
            </p>
            <p className="text-sm text-gray-600">
              {currentGenerated.qwenVerdict === 'Authentic'
                ? 'This is a good quality fake that challenges the model. Recommended to ACCEPT for training.'
                : 'This fake was detected by Qwen. You can still accept it for training variety, or reject it.'}
            </p>
          </div>

          {/* Accept/Reject Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleAccept}
              className="flex-1 bg-green-600 text-white py-4 rounded-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle size={24} />
              Accept for Dataset
            </button>
            <button
              onClick={handleReject}
              className="flex-1 bg-red-600 text-white py-4 rounded-lg hover:bg-red-700 transition-all flex items-center justify-center gap-2"
            >
              <XCircle size={24} />
              Reject & Try Again
            </button>
          </div>
        </div>
      )}

      {/* Dataset Collection */}
      {dataset.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">Generated Dataset Collection</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dataset.map(item => (
              <div
                key={item.id}
                className={`border-2 rounded-lg p-3 ${
                  item.accepted
                    ? 'border-green-400 bg-green-50'
                    : 'border-red-400 bg-red-50'
                }`}
              >
                <img
                  src={item.generatedSrc}
                  alt="Generated"
                  className="w-full h-32 object-cover rounded mb-2"
                />
                
                <div className="text-xs space-y-1">
                  <p>
                    <strong>Method:</strong> {item.method === 'nano-banana' ? 'Nano Banana' : 
                                              item.method === 'inpainting' ? 'Inpainting' : 'Rule-Based'}
                  </p>
                  <p>
                    <strong>Qwen:</strong> {item.qwenVerdict} ({item.qwenConfidence.toFixed(1)}%)
                  </p>
                  <p>
                    <strong>Status:</strong>{' '}
                    <span className={item.accepted ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                      {item.accepted ? 'Accepted' : 'Rejected'}
                    </span>
                  </p>
                </div>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="w-full mt-2 bg-red-500 text-white py-1 rounded hover:bg-red-600 transition-colors flex items-center justify-center gap-1 text-sm"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
