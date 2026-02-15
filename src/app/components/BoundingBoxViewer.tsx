import React, { useRef, useEffect, useState } from 'react';

interface BoundingBoxViewerProps {
  imageSrc: string;
  bbox?: [number, number, number, number]; // [x1, y1, x2, y2] in 0-1000 normalized coordinates
}

export function BoundingBoxViewer({ imageSrc, bbox }: BoundingBoxViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [imageSrc]);

  const renderBoundingBox = () => {
    if (!bbox || dimensions.width === 0) return null;

    // Convert normalized coordinates (0-1000) to screen coordinates
    const [x1, y1, x2, y2] = bbox;
    const screenX1 = (x1 / 1000) * dimensions.width;
    const screenY1 = (y1 / 1000) * dimensions.height;
    const screenX2 = (x2 / 1000) * dimensions.width;
    const screenY2 = (y2 / 1000) * dimensions.height;

    const width = screenX2 - screenX1;
    const height = screenY2 - screenY1;

    return (
      <div
        className="absolute border-4 border-red-500 pointer-events-none"
        style={{
          left: `${screenX1}px`,
          top: `${screenY1}px`,
          width: `${width}px`,
          height: `${height}px`,
        }}
      >
        <div className="absolute -top-8 left-0 bg-red-500 text-white px-2 py-1 rounded text-sm">
          Suspected Region
        </div>
      </div>
    );
  };

  return (
    <div ref={containerRef} className="relative inline-block w-full">
      <img
        src={imageSrc}
        alt="License plate with analysis"
        className="w-full rounded-lg"
        onLoad={() => {
          if (containerRef.current) {
            setDimensions({
              width: containerRef.current.offsetWidth,
              height: containerRef.current.offsetHeight,
            });
          }
        }}
      />
      {renderBoundingBox()}
    </div>
  );
}
