import React, { useState, useRef } from 'react';
import { Header } from './components/Header';
import { Instructions } from './components/Instructions';
import { HoodieColor, GenerationState, UploadedImage, HoodieTemplates } from './types';
import { generatePortrait } from './services/geminiService';
import { DEFAULT_HOODIE_TEMPLATES } from './constants/hoodieTemplates';

export const App: React.FC = () => {
  const [userImage, setUserImage] = useState<UploadedImage | null>(null);
  const [selectedColor, setSelectedColor] = useState<HoodieColor>(HoodieColor.GREEN);
  const [promptAdjustment, setPromptAdjustment] = useState<string>('');
  const [generationState, setGenerationState] = useState<GenerationState>({
    isGenerating: false,
    resultImage: null,
    error: null,
  });
  
  const [showSettings, setShowSettings] = useState(false);
  const [templates, setTemplates] = useState<HoodieTemplates>(DEFAULT_HOODIE_TEMPLATES);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserImage({
          file,
          previewUrl: URL.createObjectURL(file),
          base64: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!userImage) return;

    setGenerationState({ isGenerating: true, resultImage: null, error: null });

    try {
      const apiKey = process.env.API_KEY || ''; 
      
      const refHoodie = templates[selectedColor];
      
      const result = await generatePortrait(
        apiKey,
        userImage.base64,
        refHoodie,
        selectedColor,
        promptAdjustment
      );

      setGenerationState({ isGenerating: false, resultImage: result, error: null });
    } catch (error: any) {
      setGenerationState({ isGenerating: false, resultImage: null, error: error.message || "Failed to generate" });
    }
  };
  
  const handleTemplateUpload = (color: HoodieColor, file: File) => {
     const reader = new FileReader();
      reader.onloadend = () => {
        setTemplates(prev => ({
            ...prev,
            [color]: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
  };

  const generateTemplateSource = () => {
      const source = `export const DEFAULT_HOODIE_TEMPLATES: HoodieTemplates = ${JSON.stringify(templates, null, 2)};`;
      navigator.clipboard.writeText(source);
      alert("Source code copied to clipboard! Paste it into constants/hoodieTemplates.ts");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12 font-sans text-gray-900">
      <Header />
      
      <div className="fixed bottom-4 right-4 z-50">
        <button 
            onClick={() => setShowSettings(!showSettings)}
            className="bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
            title="Template Settings"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        </button>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <Instructions />

        {showSettings && (
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 mb-8">
                <h3 className="text-xl font-bold mb-4 flex justify-between items-center">
                    Template Settings
                    <button onClick={() => setShowSettings(false)} className="text-sm text-gray-500 hover:text-gray-700">Close</button>
                </h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                    {(Object.keys(HoodieColor) as Array<keyof typeof HoodieColor>).map((key) => {
                        const color = HoodieColor[key];
                        return (
                            <div key={color} className="border p-4 rounded-lg text-center">
                                <p className="font-semibold mb-2">{color} Template</p>
                                {templates[color] ? (
                                    <img src={templates[color]!} alt={color} className="w-24 h-24 object-cover mx-auto mb-2 rounded" />
                                ) : <div className="w-24 h-24 bg-gray-100 mx-auto mb-2 rounded flex items-center justify-center text-xs text-gray-400">No Image</div>}
                                <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleTemplateUpload(color, e.target.files[0])} className="text-xs w-full" />
                            </div>
                        )
                    })}
                </div>
                <button onClick={generateTemplateSource} className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                    Generate Source Code (Copy to Clipboard)
                </button>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: Controls */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* 1. Upload */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold mb-4 text-skoda-dark">1. Upload Photo</h3>
                <div 
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${userImage ? 'border-skoda-green bg-green-50' : 'border-gray-300 hover:border-skoda-green hover:bg-gray-50'}`}
                    onClick={() => fileInputRef.current?.click()}
                >
                    {userImage ? (
                        <div className="relative">
                            <img src={userImage.previewUrl} alt="Upload" className="max-h-64 mx-auto rounded shadow-sm" />
                            <div className="mt-2 text-sm text-skoda-green font-medium">Click to change photo</div>
                        </div>
                    ) : (
                        <div className="text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto mb-2 text-gray-400">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                            </svg>
                            <p className="font-medium">Click to upload portrait</p>
                            <p className="text-xs mt-1">JPG or PNG recommended</p>
                        </div>
                    )}
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageUpload}
                    />
                </div>
            </div>

            {/* 2. Select Color */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold mb-4 text-skoda-dark">2. Select Hoodie</h3>
                <div className="grid grid-cols-3 gap-3">
                    {(Object.values(HoodieColor) as HoodieColor[]).map((color) => (
                        <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={`p-3 rounded-lg border-2 font-medium transition-all flex flex-col items-center gap-2 h-auto ${selectedColor === color ? 
                                (color === HoodieColor.GREEN ? 'border-skoda-green bg-green-50 text-skoda-dark ring-2 ring-green-200 ring-offset-2' : 
                                 color === HoodieColor.BLACK ? 'border-skoda-dark bg-gray-100 text-skoda-dark ring-2 ring-gray-300 ring-offset-2' :
                                 'border-gray-300 bg-gray-50 text-skoda-dark ring-2 ring-gray-200 ring-offset-2')
                                : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}
                        >
                            {templates[color] ? (
                                <div className="w-full aspect-square bg-white rounded overflow-hidden border border-gray-100 mb-1">
                                    <img src={templates[color]!} alt={`${color} Hoodie`} className="w-full h-full object-contain" />
                                </div>
                            ) : (
                                <div className={`w-full aspect-square rounded mb-1 shadow-sm ${
                                    color === HoodieColor.GREEN ? 'bg-skoda-green' :
                                    color === HoodieColor.BLACK ? 'bg-skoda-dark' :
                                    'bg-white border border-gray-200'
                                }`}>
                                </div>
                            )}
                            <span className="capitalize">{color}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* 3. Prompt Adjustment */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold mb-2 text-skoda-dark">3. Fine-tune (Optional)</h3>
                <textarea
                  value={promptAdjustment}
                  onChange={(e) => setPromptAdjustment(e.target.value)}
                  placeholder="E.g., 'Make the smile warmer', 'Adjust lighting to be more dramatic'..."
                  className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-skoda-green focus:border-transparent outline-none resize-none h-24 bg-gray-50 text-gray-800 placeholder-gray-400"
                />
            </div>

            {/* Generate Button */}
            <button
                onClick={handleGenerate}
                disabled={!userImage || generationState.isGenerating}
                className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-md transition-all transform active:scale-95 ${!userImage || generationState.isGenerating ? 'bg-gray-400 cursor-not-allowed' : 'bg-skoda-green hover:bg-green-600 hover:shadow-lg'}`}
            >
                {generationState.isGenerating ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                    </span>
                ) : "Generate Portrait"}
            </button>
            
            {generationState.error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
                    Error: {generationState.error}
                </div>
            )}

          </div>

          {/* RIGHT COLUMN: Result */}
          <div className="lg:col-span-7">
            <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 h-full min-h-[500px] flex items-center justify-center bg-grid-pattern relative overflow-hidden">
                 {generationState.resultImage ? (
                     <div className="relative w-full h-full flex items-center justify-center">
                         <img src={generationState.resultImage} alt="Generated" className="max-w-full max-h-[80vh] rounded-lg shadow-2xl" />
                         <a 
                            href={generationState.resultImage} 
                            download="skoda-hoodie-portrait.png"
                            className="absolute bottom-4 right-4 bg-white/90 backdrop-blur text-gray-800 px-4 py-2 rounded-lg shadow-lg font-medium hover:bg-white transition-colors flex items-center gap-2"
                         >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M12 12.75l4.5-4.5m0 0l-4.5-4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Download
                         </a>
                     </div>
                 ) : (
                     <div className="text-center text-gray-400">
                         {generationState.isGenerating ? (
                             <div className="animate-pulse">
                                 <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4"></div>
                                 <p>AI is crafting your image...</p>
                             </div>
                         ) : (
                            <>
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-24 h-24 mx-auto mb-4 opacity-50">
                               <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                             </svg>
                             <p className="text-lg">Your generated photo will appear here</p>
                            </>
                         )}
                     </div>
                 )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};