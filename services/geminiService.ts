
import { GoogleGenAI, GenerateContentResponse, GroundingMetadata } from "@google/genai";
import { LanguageCode, MedicationInfo } from '../types';
import { GEMINI_TEXT_MODEL, SUPPORTED_LANGUAGES } from '../constants';
import { getCachedMedication, setCachedMedication } from './localStorageService';

// Ensure API_KEY is available via process.env
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
if (!API_KEY) {
  console.error("CRITICAL ERROR: API_KEY for Gemini is not set in environment variables. The application will not function. Please ensure process.env.API_KEY is configured.");
  throw new Error("API_KEY for Gemini is not set. This is a deployment/environment configuration issue.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const parseJsonFromText = <T,>(text: string): T | null => {
  let jsonStr = text.trim();
  const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
  const match = fenceRegex.exec(jsonStr);
  if (match && match[1]) {
    jsonStr = match[1].trim();
  }

  try {
    return JSON.parse(jsonStr) as T;
  } catch (e) {
    console.warn("Failed to parse JSON directly:", e, "Original text snippet:", text.substring(0, 500));
    const jsonLooseMatch = jsonStr.match(/({[\s\S]*})/);
    if (jsonLooseMatch && jsonLooseMatch[1]) {
      try {
        console.log("Attempting to parse loosely matched JSON from the response.");
        return JSON.parse(jsonLooseMatch[1]) as T;
      } catch (e2) {
        console.error("Failed to parse even loosely matched JSON:", e2);
      }
    }
    console.error("Ultimately failed to parse JSON from response. Text:", text);
    return null;
  }
};


export const identifyMedicationFromImage = async (base64ImageData: string): Promise<string | null> => {
  try {
    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg', 
        data: base64ImageData, 
      },
    };
    const textPart = {
      text: `Analyze the provided image. If it's a pharmaceutical product (pill, box, bottle) or a prescription, identify and list all medication names clearly visible. If it's a pill, describe its appearance (color, shape, markings) and attempt to identify it based on these features. Respond with only the most prominent or clearly identifiable medication name. If multiple distinct medications are equally clear, list them comma-separated. If no medication is identifiable or the image is not medication-related, respond with 'UNKNOWN'. Do not add any other explanatory text, greetings, or markdown formatting. Just the name(s) or 'UNKNOWN'.`,
    };

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL, 
      contents: { parts: [imagePart, textPart] },
      config: {
        temperature: 0.1, 
        topK: 1, 
        topP: 0.8, 
      }
    });

    const identifiedText = response.text.trim();
    console.log("Gemini image identification response:", identifiedText);
    if (identifiedText.toUpperCase() === 'UNKNOWN' || !identifiedText || identifiedText.toLowerCase().includes("unable to identify")) {
      return null;
    }
    return identifiedText.split(',')[0].trim();
  } catch (error) {
    console.error("Error identifying medication from image:", error);
    if (error instanceof Error && error.message.includes("deadline exceeded") ) {
         throw new Error("The request to identify the medication from the image timed out. Please try again.");
    }
    throw new Error("Gemini API failed to process the image for medication identification.");
  }
};

export const getMedicationInfo = async (
  medicationName: string, // This is the original search query
  languageCode: LanguageCode
): Promise<{ info: MedicationInfo | null; groundingMetadata?: GroundingMetadata } | null> => {
  const language = SUPPORTED_LANGUAGES.find(lang => lang.code === languageCode);
  if (!language) {
    console.error("Unsupported language code provided:", languageCode);
    throw new Error("Unsupported language code.");
  }

  // Check cache first using the original medicationName (search query)
  const cachedData = getCachedMedication(medicationName, languageCode);
  if (cachedData) {
    return { info: cachedData.info, groundingMetadata: cachedData.groundingMetadata };
  }

  const prompt = `You are a helpful medication information assistant. Provide detailed information about the medication "${medicationName}" in the ${language.name} language.
Format your response as a single, valid JSON object that can be directly parsed by JSON.parse().
The JSON object must have the following keys, with string values. Ensure all keys are present. If information for a specific key is not available or not applicable for "${medicationName}", use a descriptive phrase in ${language.name} like "Information not available", "Not applicable", or "Consult your doctor". Do not use empty strings "" for fields where information is expected but missing.

JSON Structure:
{
  "name": "string", 
  "overview": "string", 
  "usageInstructions": "string", 
  "sideEffects": "string", 
  "contradictions": "string", 
  "storageInstructions": "string", 
  "disclaimer": "This information is for educational purposes only and is not a substitute for professional medical advice. Always consult your doctor or pharmacist for any health concerns or before making any decisions related to your health or treatment. [Translate this disclaimer to ${language.name}]"
}

If the medication "${medicationName}" is not recognized or you cannot provide substantial information for it, the value for "name" should be "${medicationName} - Not Recognized" (translated to ${language.name} if possible for the 'Not Recognized' part), and other fields should contain an appropriate message like "Information not available for ${medicationName}." (translated to ${language.name}).
Ensure the entire response is ONLY the JSON object, without any surrounding text, explanations, or markdown formatting like \`\`\`json or \`\`\`.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json", 
        temperature: 0.3,
      },
    });

    console.log("Raw Gemini medication info response text:", response.text);
    const parsedInfo = parseJsonFromText<MedicationInfo>(response.text);
    const groundingMeta = response.candidates?.[0]?.groundingMetadata as GroundingMetadata | undefined;

    if (!parsedInfo) {
        console.error(`Failed to parse JSON for "${medicationName}" in ${language.name}. Raw response: ${response.text}`);
        const fallbackInfo: MedicationInfo = {
            name: `${medicationName} - Data Error`,
            overview: `Could not retrieve structured information in ${language.name}. The data format received was unexpected. Please try again or contact support if the issue persists.`,
            usageInstructions: `Consult a healthcare professional for usage and dosage instructions for ${medicationName}.`,
            sideEffects: `Consult a healthcare professional for information on side effects for ${medicationName}.`,
            contradictions: `Consult a healthcare professional for information on contradictions for ${medicationName}.`,
            storageInstructions: `Consult a healthcare professional for storage instructions for ${medicationName}.`,
            disclaimer: `This information is for educational purposes only. Always consult your doctor or pharmacist. [Translated to ${language.name}]`
        };
         try {
            const disclaimerPrompt = `Translate the following disclaimer to ${language.name}: "This information is for educational purposes only and is not a substitute for professional medical advice. Always consult your doctor or pharmacist for any health concerns or before making any decisions related to your health or treatment." Respond with only the translated text.`;
            const disclaimerResponse = await ai.models.generateContent({model: GEMINI_TEXT_MODEL, contents: disclaimerPrompt});
            fallbackInfo.disclaimer = disclaimerResponse.text.trim();
        } catch (discErr) {
            console.warn("Could not translate fallback disclaimer:", discErr);
        }
        // Do not cache fallback/error info from parsing failure.
        return { info: fallbackInfo, groundingMetadata: groundingMeta };
    }
    
    if (!parsedInfo.disclaimer || parsedInfo.disclaimer.length < 50) { 
        try {
            const disclaimerPrompt = `Translate the following disclaimer to ${language.name}: "This information is for educational purposes only and is not a substitute for professional medical advice. Always consult your doctor or pharmacist for any health concerns or before making any decisions related to your health or treatment." Respond with only the translated text.`;
            const disclaimerResponse = await ai.models.generateContent({model: GEMINI_TEXT_MODEL, contents: disclaimerPrompt});
            parsedInfo.disclaimer = disclaimerResponse.text.trim();
        } catch (discErr) {
            console.warn("Could not fetch/translate primary disclaimer, using English default:", discErr);
             parsedInfo.disclaimer = "This information is for educational purposes only and is not a substitute for professional medical advice. Always consult your doctor or pharmacist for any health concerns or before making any decisions related to your health or treatment.";
        }
    }
    
    // Cache the successfully fetched and parsed info. Pass original medicationName as originalQuery.
    setCachedMedication(medicationName, languageCode, parsedInfo, groundingMeta || null);

    if (parsedInfo.name && (parsedInfo.name.includes("Not Recognized") || parsedInfo.name.includes(" unrecognized"))) {
        console.warn(`Medication query "${medicationName}" was reported as not recognized by the model (API returned name: "${parsedInfo.name}") in ${language.name}.`);
    }

    return { info: parsedInfo, groundingMetadata: groundingMeta };

  } catch (error) {
    console.error(`Error fetching medication info for "${medicationName}" in ${language.name}:`, error);
    let errorMessage = `An error occurred while fetching information for "${medicationName}". Please try again later.`;
    if (error instanceof Error) {
        if (error.message.includes("deadline exceeded")) {
            errorMessage = `The request for information about "${medicationName}" timed out. Please try again.`;
        } else if (error.message.includes("API key not valid")) {
            errorMessage = "API Key Invalid. Please check application configuration.";
        } else {
            errorMessage = `API Error: ${error.message}`;
        }
    }

     const errorInfo: MedicationInfo = {
        name: `${medicationName} - API Error`,
        overview: errorMessage,
        usageInstructions: "", 
        sideEffects: "", 
        contradictions: "", 
        storageInstructions: "",
        disclaimer: `An API error prevented information retrieval. Always consult a healthcare professional. [Translated to ${language.name}]`
    };
     try {
        const disclaimerPrompt = `Translate the following text to ${language.name}: "An API error prevented information retrieval. Always consult a healthcare professional." Respond with only the translated text.`;
        const disclaimerResponse = await ai.models.generateContent({model: GEMINI_TEXT_MODEL, contents: disclaimerPrompt});
        errorInfo.disclaimer = disclaimerResponse.text.trim();
    } catch (discErr) {
        console.warn("Could not translate error disclaimer:", discErr);
    }
    // Do not cache API error info.
    return { info: errorInfo };
  }
};
