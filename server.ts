import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProd = process.env.NODE_ENV === 'production';
const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));

  // Initialize Gemini AI securely server-side.
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Config check endpoint
  app.get('/api/config', (req, res) => {
    res.json({
      geminiKeyConfigured: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'
    });
  });

  // API Endpoint for AI analysis of wound images
  app.post('/api/analyze', async (req, res) => {
    try {
      const { image, petInfo } = req.body;
      if (!image) {
        return res.status(400).json({ error: 'No image provided' });
      }

      if (!process.env.GEMINI_API_KEY) {
        // Return a helper stating key is missing, so client can fall back gracefully
        return res.status(401).json({ 
          error: 'GEMINI_API_KEY_MISSING',
          message: 'Gemini API Key is not configured in Secrets. Falling back to high-fidelity simulated analysis.'
        });
      }

      // Base64 image extraction
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Data,
            },
          },
          {
            text: `You are "Pet Smile AI", an expert veterinary assistant.
Analyze this image of a pet wound.
The pet is a ${petInfo?.species || 'unknown pet'} named "${petInfo?.name || 'Luna'}", age ${petInfo?.age || '3y'}, breed "${petInfo?.breed || 'Golden Retriever'}".

Your objective IS NOT to diagnose diseases or guarantee a specific diagnosis.
Your objective is to:
1. Detect if the image is usable (is it sharp, clear, has correct lighting, focus, distance, no fingers blocking?).
2. Species identification (verify if it is a Dog, Cat, or unsupported animal).
3. Estimate wound severity (Level 1 to 5).
4. Explain findings in simple, comforting language for a pet owner with no medical knowledge.
5. Provide safe first-aid recommendations (strictly NO prescription drugs, NO antibiotics, NO steroids, NO human medications).
6. State limitations and confidence clearly.
7. Encourage veterinary care whenever appropriate.

Never claim certainty. Always communicate confidence levels.
Always use cautious language like "This appearance may suggest...", "This could indicate...", "Please consult a veterinarian...".

If there are extreme red flags present (e.g., heavy active bleeding, bone visible, eye injury, black dead tissue, maggots, collapse), set isEmergency to true and severityLevel to 5.

You must respond with a strictly formatted JSON object matching this TypeScript structure:
{
  "imageQualityScore": number, // 0-100 (evaluate clarity, lighting, sharpness)
  "imageQualityExplanation": string, // Explanation of image quality issues or confirmation of clear shot
  "isUsable": boolean, // Whether the image is usable (true if imageQualityScore >= 70)
  "detectedSpecies": "Dog" | "Cat" | "Other" | "None",
  "speciesConfidence": number, // 0-100
  "bodyPart": string, // e.g. "Front Left Paw", "Lower Abdomen", "Muzzle"
  "estimatedSize": string, // e.g. "approx. 1.5 cm"
  "severityLevel": 1 | 2 | 3 | 4 | 5, // 1: Minor, 2: Mild, 3: Moderate, 4: Serious, 5: Emergency
  "severityExplanation": string, // Clear, reassuring description of severity and visual characteristics
  "confidenceScore": number, // 0-100 overall confidence
  "features": {
    "swelling": "None" | "Mild" | "Moderate" | "Severe",
    "redness": "None" | "Mild" | "Moderate" | "Severe",
    "discharge": "None" | "Serous (Clear)" | "Purulent (Pus)" | "Bloody",
    "bleeding": "None" | "Mild (Spotting)" | "Active" | "Severe",
    "healingStage": "Acute / Fresh" | "Inflammatory" | "Granulation" | "Epithelialization" | "Healed" | "Unknown"
  },
  "isEmergency": boolean, // true if level 4/5 or major red flag
  "riskExplanation": string, // description of potential risk factors, e.g., infection, tearing
  "causes": string[], // 2-3 possible causes (e.g. scrape, sharp objects, insect bite) using cautious language
  "firstAid": string[], // 3-4 safe first-aid steps (clean with saline, prevent licking, keep dry, use cone)
  "avoid": string[], // what to avoid (no human ointments, do not let lick, no bandages without vet advice)
  "seekCareTimeframe": string, // e.g. "Seek care within 24 hours" or "Immediate emergency care required"
  "emergencyIndicators": string[] // what emergency symptoms to monitor for
}

Return ONLY raw JSON, with no markdown code blocks or wrapper text.`,
          },
        ],
        config: {
          responseMimeType: 'application/json',
        }
      });

      const responseText = response.text || '{}';
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const parsedData = JSON.parse(cleanJson);
      res.json(parsedData);
    } catch (error: any) {
      console.error('API Error:', error);
      res.status(500).json({ error: error?.message || 'Failed to analyze image' });
    }
  });

  // Serve static files / Vite middleware
  if (isProd) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Pet Smile AI server is running on http://localhost:${PORT}`);
  });
}

startServer();
