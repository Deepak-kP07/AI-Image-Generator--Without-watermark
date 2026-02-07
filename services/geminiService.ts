import { GoogleGenAI } from "@google/genai";
import { GenerationRequest, ModelType, GenerationMode } from "../types";
import { SYSTEM_PROMPT_ENHANCER } from "../constants";

// --- ENVIRONMENT SAFETY ---
// Vite: Use import.meta.env for VITE_ prefixed vars, process.env for others (via vite.config)
const getEnv = (key: string) => {
  // Try import.meta.env with VITE_ prefix first (standard Vite way)
  // @ts-ignore
  if (import.meta.env && import.meta.env[`VITE_${key}`]) {
    // @ts-ignore
    const value = import.meta.env[`VITE_${key}`];
    console.log(`✅ Found ${key} via import.meta.env.VITE_${key}`);
    return value;
  }
  // Try import.meta.env without prefix (if vite.config exposes it)
  // @ts-ignore
  if (import.meta.env && import.meta.env[key]) {
    // @ts-ignore
    const value = import.meta.env[key];
    console.log(`✅ Found ${key} via import.meta.env.${key}`);
    return value;
  }
  // Fallback to process.env (exposed via vite.config)
  // @ts-ignore
  if (process.env && process.env[key]) {
    // @ts-ignore
    const value = process.env[key];
    console.log(`✅ Found ${key} via process.env.${key}`);
    return value;
  }
  // @ts-ignore
  if (process.env && process.env[`VITE_${key}`]) {
    // @ts-ignore
    const value = process.env[`VITE_${key}`];
    console.log(`✅ Found ${key} via process.env.VITE_${key}`);
    return value;
  }
  console.warn(`⚠️ ${key} not found in environment variables`);
  return "";
};

// --- API KEYS ---
const STABILITY_API_KEY = getEnv("STABILITY_API_KEY");
const HF_API_KEY = getEnv("HF_API_KEY");

// Debug: Log API key status (without exposing full keys)
console.log("🔑 API Keys Status:", {
  STABILITY_API_KEY: STABILITY_API_KEY ? `Found (${STABILITY_API_KEY.substring(0, 10)}...)` : "Missing",
  HF_API_KEY: HF_API_KEY ? `Found (${HF_API_KEY.substring(0, 10)}...)` : "Missing"
});

const getClient = () => {
  // Try multiple ways to get API key - check in order of preference
  // @ts-ignore
  let apiKey = import.meta.env?.VITE_API_KEY;
  // @ts-ignore
  if (!apiKey) apiKey = import.meta.env?.API_KEY;
  // @ts-ignore
  if (!apiKey) apiKey = process.env?.API_KEY;
  // @ts-ignore
  if (!apiKey) apiKey = process.env?.VITE_API_KEY;
  
  console.log("🔑 Gemini API Key check:", apiKey ? `Found (${apiKey.substring(0, 10)}...)` : "Missing");
  if (!apiKey) {
    throw new Error(
      "Gemini API Key missing. Please ensure API_KEY is set in your .env.local file."
    );
  }
  return new GoogleGenAI({ apiKey });
};

export const enhanceUserPrompt = async (
  originalPrompt: string
): Promise<string> => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: SYSTEM_PROMPT_ENHANCER + originalPrompt,
    });
    return response.text || originalPrompt;
  } catch (e) {
    console.error("Prompt enhancement failed", e);
    return originalPrompt;
  }
};

export const generateTextResponse = async (prompt: string): Promise<string> => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return (
      response.text ||
      "I understand your prompt, but I couldn't generate an image or a text response for it."
    );
  } catch (e: any) {
    throw new Error(`Text generation failed: ${e.message}`);
  }
};

const generateFlux = async (
  prompt: string,
  aspectRatio: string,
  referenceImage?: string
): Promise<string[]> => {
  console.log("🎨 Generating Flux image:", { prompt: prompt.substring(0, 50), aspectRatio, hasReference: !!referenceImage });
  
  if (!STABILITY_API_KEY) {
    const errorMsg = "Stability API Key is missing. Please set STABILITY_API_KEY or VITE_STABILITY_API_KEY in your .env.local file.\n\nGet your API key from: https://platform.stability.ai/";
    console.error("❌", errorMsg);
    throw new Error(errorMsg);
  }
  
  const formData = new FormData();
  formData.append("prompt", prompt);
  formData.append("output_format", "png");

  if (referenceImage) {
    // Image-to-Image mode
    formData.append("mode", "image-to-image");
    formData.append("strength", "0.7"); // Default strength for editing

    // Fetch blob from data URL
    const res = await fetch(referenceImage);
    const blob = await res.blob();
    formData.append("image", blob);
  } else {
    // Text-to-Image mode - Flux Schnell endpoint
    formData.append("aspect_ratio", aspectRatio);
  }

  // FIX: Use correct Flux Schnell endpoint
  // Stability AI v2beta API - Try multiple endpoint formats
  // Note: Flux Schnell may require specific API access or subscription
  // If Flux endpoints fail, we'll fall back to SD3 which is more widely available
  
  let endpoint: string;
  let useFlux = true;
  
  if (referenceImage) {
    // Image-to-image editing - try Flux first, fallback to SD3
    endpoint = "https://api.stability.ai/v2beta/stable-image/edit/flux-schnell";
  } else {
    // Text-to-image generation - try Flux Schnell
    // If this fails with 404, Flux may not be available - try SD3 instead
    endpoint = "https://api.stability.ai/v2beta/stable-image/generate/flux-schnell";
  }

  console.log("📤 Calling Stability AI:", endpoint);
  console.log("📋 Request details:", {
    endpoint,
    hasPrompt: !!prompt,
    aspectRatio,
    hasReferenceImage: !!referenceImage
  });

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${STABILITY_API_KEY}`,
      Accept: "image/*",
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `Stability API Error (${response.status})`;
    
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorJson.error || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }
    
    // Provide helpful error messages
    if (response.status === 401) {
      errorMessage = "Invalid API key. Please check your STABILITY_API_KEY in .env.local";
    } else if (response.status === 402) {
      errorMessage = "Insufficient credits. Please add credits to your Stability AI account.";
    } else if (response.status === 404) {
      errorMessage = `Flux Schnell endpoint not found (404).\n\nThis model may:\n- Require a paid Stability AI subscription\n- Not be available in your region\n- Have been deprecated or moved\n\n💡 Recommendation: Switch to "Nano Banana (Fast)" or "Stable Diffusion XL" models which are free and work reliably.\n\nTo use Flux, check:\n1. Your Stability AI account has Flux access enabled\n2. Visit https://platform.stability.ai/ to upgrade your plan\n3. Verify your API key permissions`;
    } else if (response.status === 429) {
      errorMessage = "Rate limit exceeded. Please wait a moment and try again.";
    }
    
    console.error("❌ Stability API Error:", {
      status: response.status,
      statusText: response.statusText,
      endpoint,
      error: errorMessage,
      responseText: errorText.substring(0, 200)
    });
    throw new Error(`${errorMessage}\n\nStatus: ${response.status}\nEndpoint: ${endpoint}`);
  }

  const blob = await response.blob();
  const base64 = await blobToBase64(blob);
  console.log("✅ Flux image generated successfully");
  return [base64];
};

const generateSDXL = async (prompt: string): Promise<string[]> => {
  if (!HF_API_KEY) {
      throw new Error("Hugging Face API Key is missing. Please add VITE_HF_API_KEY (or HF_API_KEY) to your .env file to use free Stable Diffusion generation.");
  }

  // FIX: Use correct Hugging Face Inference API endpoint
  const response = await fetch(
    "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
    {
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          num_inference_steps: 20,
          guidance_scale: 7.5
        }
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    // Handle rate limiting and model loading
    if (response.status === 503) {
      throw new Error(`Hugging Face API Error: Model is loading. Please wait a moment and try again. Status: ${response.status}`);
    }
    throw new Error(`Hugging Face API Error: ${response.status} - ${errorText}`);
  }

  const blob = await response.blob();
  const base64 = await blobToBase64(blob);
  return [base64];
};

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
};

// --- Video Generation ---
export const generateVideo = async (
  request: GenerationRequest
): Promise<string> => {
  const { prompt, referenceImage, settings } = request;
  const ai = getClient();

  // Handle native audio preference in prompt
  let finalPrompt = prompt;
  if (settings.includeAudio) {
    finalPrompt +=
      ". Include realistic native audio, sound effects, and dialogue if applicable.";
  }

  // Config setup
  const videoConfig: any = {
    numberOfVideos: 1,
    resolution: settings.videoResolution,
    aspectRatio: settings.aspectRatio,
  };

  const modelParams: any = {
    model: settings.model,
    prompt: finalPrompt,
    config: videoConfig,
  };

  // Add reference image if present (as starting frame)
  if (referenceImage) {
    const base64Data = referenceImage.split(",")[1] || referenceImage;
    const mimeType = referenceImage.match(/data:([^;]+);/)?.[1] || "image/png";
    modelParams.image = {
      imageBytes: base64Data,
      mimeType: mimeType,
    };
  }

  // 1. Start Operation
  let operation = await ai.models.generateVideos(modelParams);

  // 2. Poll until done
  // Veo can take a minute or more.
  while (!operation.done) {
    await new Promise((resolve) => setTimeout(resolve, 5000)); // Poll every 5s
    operation = await ai.operations.getVideosOperation({
      operation: operation,
    });
  }

  // 3. Get URI
  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) {
    throw new Error("Video generation completed but no URI returned.");
  }

  // 4. Fetch the actual video bytes using the key
  // @ts-ignore
  let apiKey = import.meta.env?.API_KEY || import.meta.env?.VITE_API_KEY;
  // @ts-ignore
  if (!apiKey) apiKey = process.env?.API_KEY || process.env?.VITE_API_KEY;
  const separator = downloadLink.includes("?") ? "&" : "?";
  const videoRes = await fetch(`${downloadLink}${separator}key=${apiKey}`);

  if (!videoRes.ok) {
    throw new Error(
      `Failed to download generated video content. Status: ${videoRes.status}`
    );
  }

  const videoBlob = await videoRes.blob();
  return URL.createObjectURL(videoBlob);
};

export const generateOrEditImage = async (
  request: GenerationRequest
): Promise<{ images: string[]; text?: string }> => {
  const { prompt, referenceImage, settings } = request;
  let modelName: ModelType | string = settings.model;

  // FIX: Handle cached legacy model name from local storage/old sessions
  // Only switch truly broken/legacy model names to SD_XL (Free)
  if (typeof modelName === 'string' && modelName === 'gemini-2.5-flash') {
      console.warn("Detected legacy model name. Auto-correcting to 'stable-diffusion-xl-base-1.0' (Free).");
      modelName = ModelType.SD_XL;
  }

  // Handle third-party models
  if (modelName === ModelType.FLUX_SCHNELL) {
    const images = await generateFlux(
      prompt,
      settings.aspectRatio,
      referenceImage
    );
    return { images };
  }
  if (modelName === ModelType.SD_XL) {
    if (referenceImage) {
      throw new Error(
        "Stable Diffusion XL does not support image editing/reference images in this app. Please use Gemini 2.5 Flash Image or Flux."
      );
    }
    const images = await generateSDXL(prompt);
    return { images };
  }


  // Handle Gemini Models
  const ai = getClient();
  const parts: any[] = [];

  if (referenceImage) {
    const base64Data = referenceImage.split(",")[1] || referenceImage;
    const mimeType = referenceImage.match(/data:([^;]+);/)?.[1] || "image/png";
    parts.push({ inlineData: { data: base64Data, mimeType: mimeType } });
  }

  // --- QUALITY & LAYOUT ENFORCEMENT ---
  let visualPrompt = prompt;

  if (
    prompt.toLowerCase().includes("description") ||
    prompt.toLowerCase().includes("here's") ||
    prompt.toLowerCase().includes("detailed description")
  ) {
    visualPrompt = prompt
      .replace(/here's a detailed description/gi, "")
      .replace(/description/gi, "visual")
      .replace(/create a/gi, "draw")
      .replace(/show/gi, "render")
      .trim();

    if (
      !visualPrompt.toLowerCase().startsWith("draw") &&
      !visualPrompt.toLowerCase().startsWith("render") &&
      !visualPrompt.toLowerCase().startsWith("visualize")
    ) {
      visualPrompt = "Draw " + visualPrompt;
    }
  }

  const QUALITY_SUFFIX = ", professional illustration, 8k resolution, highly detailed";
  const finalPrompt = visualPrompt + QUALITY_SUFFIX;

  console.log("🎨 Original prompt:", prompt.substring(0, 100));
  console.log("🖼️ Visual prompt:", finalPrompt.substring(0, 100));

  parts.push({ text: finalPrompt });

  try {
    const count = settings.numberOfImages || 1;
    // Generate multiple images concurrently
    const promises = Array.from({ length: count }).map(async () => {
      // Config for image generation
      const config: any = {
        responseModalities: ["image"], // Lowercase "image" is often preferred/safer
        imageConfig: {
          aspectRatio: settings.aspectRatio,
          ...(modelName === ModelType.GEMINI_PRO_IMAGE
            ? { imageSize: "2K" }
            : {}),
        },
      };

      // FIX: Correct API structure for Gemini image generation
      const requestParams: any = {
        model: modelName,
        contents: parts,
        config: config,
      };

      console.log("🔍 Gemini Image Request:", { 
        model: modelName, 
        parts: parts.length,
        config: config 
      });
      
      try {
        return await ai.models.generateContent(requestParams);
      } catch (apiError: any) {
        console.error("❌ Gemini API Error Details:", {
          model: modelName,
          error: apiError.message,
          stack: apiError.stack
        });
        throw new Error(`Gemini API call failed for model ${modelName}: ${apiError.message}`);
      }
    });

    const responses = await Promise.all(promises);

    console.log("✅ Gemini API Response received:", {
      responseCount: responses.length,
      firstResponseKeys: responses[0] ? Object.keys(responses[0]) : [],
      hasCandidates: !!responses[0]?.candidates
    });

    const generatedImages: string[] = [];
    for (const response of responses) {
      // Check response structure for SDK v1.x
      // It might be response.candidates[0].content.parts[0].inlineData
      const candidates = response.candidates;
      if (candidates && candidates.length > 0) {
          for (const candidate of candidates) {
              const contentParts = candidate.content?.parts;
              if (contentParts && contentParts.length > 0) {
                  for (const part of contentParts) {
                      if (part.inlineData && part.inlineData.data) {
                          const mime = part.inlineData.mimeType || "image/png";
                          generatedImages.push(`data:${mime};base64,${part.inlineData.data}`);
                      } else if (part.text) {
                          console.warn("⚠️ Received text part instead of image:", part.text.substring(0, 100));
                      }
                  }
              } else {
                  console.warn("⚠️ Candidate has no content parts:", candidate);
              }
          }
      } else {
          console.warn("⚠️ Response has no candidates:", response);
      }
    }

    if (generatedImages.length > 0) {
      return { images: generatedImages };
    }

    // Error handling for text responses
    const firstResponseText = responses[0]?.text;
    if (firstResponseText) {
       return { 
           images: [], 
           text: `⚠️ Text Response: ${firstResponseText.substring(0, 200)}...` 
       };
    }

    throw new Error("No image generated. The model returned an empty response.");

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // Return error as text to be displayed in UI
    return {
        images: [],
        text: `⚠️ Image Generation Failed\n\nError: ${error.message || error.toString()}\n\nModel: ${modelName}`
    };
  }
};
