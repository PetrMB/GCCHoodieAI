import React from 'react';

export const Instructions: React.FC = () => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-skoda-green text-white flex items-center justify-center text-sm">i</span>
        Instructions
      </h2>
      <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
        <div className="flex flex-col gap-2">
          <span className="font-bold text-skoda-dark">Step 1: Upload Your Photo</span>
          <p>Upload a clear photo of your face. A photo that already includes shoulders/upper body works best.</p>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-bold text-skoda-dark">Step 2: Generate</span>
          <p>Select color and generate. The AI will create a waist-up LinkedIn style portrait.</p>
        </div>
      </div>
    </div>
  );
};