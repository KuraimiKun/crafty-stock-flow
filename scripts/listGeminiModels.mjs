#!/usr/bin/env node
const apiKey = process.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  console.error('Missing VITE_GEMINI_API_KEY environment variable.');
  process.exit(1);
}

const apiBase = process.env.VITE_GEMINI_API_BASE?.trim() || 'https://generativelanguage.googleapis.com/v1';
const url = `${apiBase}/models?key=${apiKey}`;

async function main() {
  const response = await fetch(url);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini listModels failed: ${errorText}`);
  }

  const data = await response.json();
  const models = data?.models ?? [];
  console.log(JSON.stringify(models, null, 2));
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
