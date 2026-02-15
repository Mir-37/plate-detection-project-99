import React, { useCallback } from 'react';
import { Upload, X } from 'lucide-react';

interface ImageUploadProps {
  onImageSelect: (file: File, preview: string) => void;
  currentImage?: string;
  onClear?: () => void;
}

export function ImageUpload({ onImageSelect, currentImage, onClear }: ImageUploadProps) {
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const preview = URL.createObjectURL(file);
      onImageSelect(file, preview);
    }
  }, [onImageSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      onImageSelect(file, preview);
    }
  }, [onImageSelect]);

  return (
    <div className="w-full">
      {!currentImage ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors cursor-pointer"
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-600 mb-2">
              Drag and drop an image here, or click to select
            </p>
            <p className="text-sm text-gray-400">
              Supports: JPG, PNG, JPEG
            </p>
          </label>
        </div>
      ) : (
        <div className="relative">
          <img
            src={currentImage}
            alt="Uploaded license plate"
            className="w-full rounded-lg shadow-lg"
          />
          {onClear && (
            <button
              onClick={onClear}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
