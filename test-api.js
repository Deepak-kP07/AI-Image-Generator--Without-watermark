// Quick test script to verify your Gemini API key
// Run with: node test-api.js

import { GoogleGenAI } from '@google/genai';

const API_KEY = process.env.API_KEY ;

async function testGeminiAPI() {
  try {
    console.log('🔑 Testing Gemini API key...');

    const ai = new GoogleGenAI({ apiKey: API_KEY });

    // Test 1: Basic text generation
    console.log('📤 Testing text generation...');
    const textResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Say hello in one word'
    });
    console.log('✅ Text generation works:', textResponse.text);

    // Test 2: Image generation
    console.log('📤 Testing image generation...');
    const imageResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // Try different model names
      contents: 'Generate an image of a red rose',
      config: {
        responseModalities: ["image"],
        imageConfig: {
          aspectRatio: '1:1'
        }
      }
    });

    console.log('✅ Image generation works!');
    console.log('🎉 Both text and image generation are working!');

  } catch (error) {
    console.error('❌ Error:', error.message);

    // Try alternative model name
    if (error.message.includes('model') || error.message.includes('not found')) {
      console.log('🔄 Trying alternative model name...');
      try {
        const ai = new GoogleGenAI({ apiKey: API_KEY });
        const altResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash-preview-image',
          contents: 'Generate an image of a red rose',
          config: {
            responseModalities: ["image"],
            imageConfig: {
              aspectRatio: '1:1'
            }
          }
        });
        console.log('✅ Alternative model works!');
        console.log('🔧 Update your code to use: gemini-2.5-flash-preview-image');
      } catch (altError) {
        console.error('❌ Alternative model also failed:', altError.message);
      }
    }

    if (error.message.includes('API_KEY_INVALID')) {
      console.log('🔧 Solution: Get a new API key from https://aistudio.google.com/app/apikey');
    } else if (error.message.includes('quota') || error.message.includes('429')) {
      console.log('🔧 Solution: Check your usage at https://ai.dev/usage');
      console.log('🔧 Or upgrade your plan at https://aistudio.google.com/app/apikey');
    }
  }
}

testGeminiAPI();
