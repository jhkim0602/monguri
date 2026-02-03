"use client";

import * as React from "react";
import { X, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Button } from "./button";

interface ImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
}

export function ImageViewerModal({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
}: ImageViewerModalProps) {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);

  React.useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Toolbar */}
      <div className="absolute top-4 left-4 flex gap-2">
        <Button variant="ghost" className="text-white hover:bg-white/10 gap-2">
          <Download className="w-4 h-4" /> Download
        </Button>
      </div>

      {/* Main Image */}
      <div className="relative w-full h-full flex items-center justify-center p-12">
        {images.length > 1 && (
          <button
            onClick={() =>
              setCurrentIndex((prev) =>
                prev === 0 ? images.length - 1 : prev - 1,
              )
            }
            className="absolute left-4 p-2 text-white hover:bg-white/10 rounded-full"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
        )}

        <img
          src={images[currentIndex]}
          alt={`View ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain shadow-2xl"
        />

        {images.length > 1 && (
          <button
            onClick={() =>
              setCurrentIndex((prev) =>
                prev === images.length - 1 ? 0 : prev + 1,
              )
            }
            className="absolute right-4 p-2 text-white hover:bg-white/10 rounded-full"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="absolute bottom-4 flex gap-2 overflow-x-auto p-2 bg-black/50 rounded-xl backdrop-blur">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-12 h-12 rounded-md overflow-hidden border-2 transition-all ${idx === currentIndex ? "border-white scale-110" : "border-transparent opacity-50"}`}
            >
              <img
                src={img}
                alt="thumb"
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
