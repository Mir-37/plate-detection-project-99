import React, { useState } from 'react';
import { Upload, CheckCircle, XCircle, Trash2, Download, Database } from 'lucide-react';

interface TrainingImage {
  id: string;
  preview: string;
  label: 'real' | 'fake' | null;
  filename: string;
}

export function TrainingPanel() {
  const [trainingImages, setTrainingImages] = useState<TrainingImage[]>([]);
  const [stats, setStats] = useState({ real: 0, fake: 0 });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages: TrainingImage[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      preview: URL.createObjectURL(file),
      label: null,
      filename: file.name,
    }));
    
    setTrainingImages(prev => [...prev, ...newImages]);
  };

  const handleLabel = (id: string, label: 'real' | 'fake') => {
    setTrainingImages(prev => 
      prev.map(img => {
        if (img.id === id) {
          const oldLabel = img.label;
          
          // Update stats
          if (oldLabel === 'real') setStats(s => ({ ...s, real: s.real - 1 }));
          if (oldLabel === 'fake') setStats(s => ({ ...s, fake: s.fake - 1 }));
          if (label === 'real') setStats(s => ({ ...s, real: s.real + 1 }));
          if (label === 'fake') setStats(s => ({ ...s, fake: s.fake + 1 }));
          
          return { ...img, label };
        }
        return img;
      })
    );
  };

  const handleDelete = (id: string) => {
    setTrainingImages(prev => {
      const img = prev.find(i => i.id === id);
      if (img?.label === 'real') setStats(s => ({ ...s, real: s.real - 1 }));
      if (img?.label === 'fake') setStats(s => ({ ...s, fake: s.fake - 1 }));
      return prev.filter(img => img.id !== id);
    });
  };

  const handleExportDataset = () => {
    const dataset = trainingImages
      .filter(img => img.label !== null)
      .map(img => ({
        filename: img.filename,
        label: img.label,
      }));
    
    const dataStr = JSON.stringify(dataset, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `training_dataset_${Date.now()}.json`;
    link.click();
  };

  const unlabeledCount = trainingImages.filter(img => img.label === null).length;
  const totalLabeled = stats.real + stats.fake;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Database className="text-purple-600" size={28} />
          <h2 className="text-2xl font-bold">AI Training Dataset Builder</h2>
        </div>
        
        {totalLabeled > 0 && (
          <button
            onClick={handleExportDataset}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={18} />
            Export Dataset ({totalLabeled})
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Real Images</p>
              <p className="text-3xl font-bold text-green-600">{stats.real}</p>
            </div>
            <CheckCircle className="text-green-500" size={40} />
          </div>
        </div>

        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Fake Images</p>
              <p className="text-3xl font-bold text-red-600">{stats.fake}</p>
            </div>
            <XCircle className="text-red-500" size={40} />
          </div>
        </div>

        <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unlabeled</p>
              <p className="text-3xl font-bold text-orange-600">{unlabeledCount}</p>
            </div>
            <Upload className="text-orange-500" size={40} />
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="mb-6">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
          className="hidden"
          id="training-upload"
        />
        <label
          htmlFor="training-upload"
          className="flex items-center justify-center gap-2 w-full p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 transition-colors cursor-pointer bg-gray-50"
        >
          <Upload className="text-gray-400" size={24} />
          <span className="text-gray-600">Upload Training Images (Multiple files supported)</span>
        </label>
      </div>

      {/* Instructions */}
      {trainingImages.length === 0 && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-center">
          <p className="text-gray-700 mb-2">
            <strong>Instructions:</strong> Upload license plate images and label them as Real or Fake to build your training dataset.
          </p>
          <p className="text-sm text-gray-600">
            This dataset will be used to fine-tune the VLM model using Unsloth framework on Google Colab.
          </p>
        </div>
      )}

      {/* Image Grid */}
      {trainingImages.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trainingImages.map(image => (
            <div
              key={image.id}
              className={`border-2 rounded-lg p-3 transition-all ${
                image.label === 'real'
                  ? 'border-green-400 bg-green-50'
                  : image.label === 'fake'
                  ? 'border-red-400 bg-red-50'
                  : 'border-gray-300 bg-white'
              }`}
            >
              <div className="relative mb-3">
                <img
                  src={image.preview}
                  alt={image.filename}
                  className="w-full h-40 object-cover rounded"
                />
                <button
                  onClick={() => handleDelete(image.id)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <p className="text-xs text-gray-600 mb-3 truncate" title={image.filename}>
                {image.filename}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => handleLabel(image.id, 'real')}
                  className={`flex-1 py-2 rounded flex items-center justify-center gap-1 transition-all ${
                    image.label === 'real'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-green-100'
                  }`}
                >
                  <CheckCircle size={16} />
                  <span className="text-sm font-medium">Real</span>
                </button>

                <button
                  onClick={() => handleLabel(image.id, 'fake')}
                  className={`flex-1 py-2 rounded flex items-center justify-center gap-1 transition-all ${
                    image.label === 'fake'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-red-100'
                  }`}
                >
                  <XCircle size={16} />
                  <span className="text-sm font-medium">Fake</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
