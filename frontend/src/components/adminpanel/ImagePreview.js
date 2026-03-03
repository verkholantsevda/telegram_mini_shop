import React from 'react';

const ImagePreview = ({ images, removeImage }) => {
  return (
    <div className="flex flex-wrap gap-2 mb-2">
      {images.map((src, index) => (
        <div key={index} className="relative w-20 h-20">
          <img src={src} alt="preview" className="w-full h-full object-cover rounded" />
          <button
            onClick={() => removeImage(index)}
            className="absolute top-0 right-0 bg-red-500 text-white text-xs p-1 rounded-full"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

export default ImagePreview;
