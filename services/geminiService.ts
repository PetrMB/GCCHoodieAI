
import { GoogleGenAI, Modality } from "@google/genai";
import { HoodieColor } from '../types';

/**
 * Extracts mime type and raw base64 data from a data URL.
 */
const getBase64Details = (dataUrl: string): { mimeType: string; data: string } => {
  // Regex to capture mime type and base64 data
  // Format: data:[<mime type>][;charset=<charset>][;base64],<encoded data>
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  
  if (match && match.length === 3) {
    return {
      mimeType: match[1],
      data: match[2]
    };
  }
  
  // Fallback for simple comma separation if regex fails
  const parts = dataUrl.split(',');
  return {
    mimeType: parts[0].match(/:(.*?);/)?.[1] || 'image/png',
    data: parts[1]
  };
};

/**
 * Generates a professional portrait using Gemini 2.5 Flash Image.
 * It instructs the model to edit the uploaded image to wear the specific branded hoodie.
 */
export const generatePortrait = async (
  apiKey: string,
  imageBase64: string,
  referenceHoodieBase64: string | null,
  hoodieColor: HoodieColor,
  userInstructions: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey });

  // Detailed description of the branding elements based on user request
  const hoodieDescription = `
    The person MUST be wearing the ${hoodieColor.toLowerCase()} hoodie shown in the second reference image.
    
    BRANDING & DESIGN RULES:
    1. **Chest Logo:** "SKODA" with "GCC" below it on the LEFT CHEST. Keep the text clear and legible.
    2. **Sleeve Graphic:** A minimalist electronic circuit line graphic located STRICTLY on the SLEEVE CUFF (wrist area). 
       - CRITICAL: Do NOT place any graphics on the shoulder, upper arm, or main body. The shoulder must be clean solid color.
    3. **Color:** The hoodie must be ${hoodieColor.toLowerCase()}. Match the reference exactly.
    4. **Fit:** Professional, well-fitted office hoodie.
  `;

  const basePrompt = `
    Create a professional corporate MEDIUM SHOT (waist-up) portrait.
    
    INSTRUCTIONS:
    1. **Subject:** Use the face from the first image. Preserve facial features, expression, and identity exactly.
    2. **Attire:** The person must be wearing the hoodie from the second reference image.
    3. **Framing:** WAIST-UP / MEDIUM SHOT. 
       - It is CRITICAL to show the shoulders, chest, and upper arms to display the hoodie logo and pockets. 
       - Do NOT crop tightly around the face. Zoom out to show the body.
    4. **Background:** Professional, bright office environment or clean studio gradient (LinkedIn style).
    5. **Lighting:** Soft, professional studio lighting.
    
    ${hoodieDescription}
    
    High quality, photorealistic, 4k resolution, professional photography.
  `;

  const finalPrompt = userInstructions 
    ? `${basePrompt}\nAdditional User Adjustments: ${userInstructions}`
    : basePrompt;

  // Prepare user image part
  const userImageDetails = getBase64Details(imageBase64);
  const parts: any[] = [
    {
        inlineData: {
            data: userImageDetails.data,
            mimeType: userImageDetails.mimeType,
        },
    },
  ];

  // If a reference hoodie is provided, append it
  if (referenceHoodieBase64) {
      const refImageDetails = getBase64Details(referenceHoodieBase64);
      parts.push({
          inlineData: {
              data: refImageDetails.data,
              mimeType: refImageDetails.mimeType,
          }
      });
  }

  // Append prompt
  parts.push({
      text: finalPrompt,
  });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: parts,
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    // Extract the generated image
    const part = response.candidates?.[0]?.content?.parts?.[0];
    if (part && part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
    }
    
    throw new Error("No image generated.");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
