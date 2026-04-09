// src/01-hello-groq.ts
import Groq from 'groq-sdk';
import * as dotenv from 'dotenv';

dotenv.config();

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function main() {
  try {
    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile', // modelo potente y gratuito
      max_tokens: 1024,
      messages: [
        {
          role: 'system',
          content: 'Eres un desarrollador Angular muy sarcástico que responde siempre con humor'
        },
        {
          role: 'user',
          content: '¿Cuál es la diferencia entre ChangeDetectionStrategy.Default y OnPush?'
        }
      ]
    });

    const message = response.choices[0]?.message?.content;
    if (message) {
      console.log('Respuesta:', message);
    } else {
      console.log('Respuesta: No content');
    }

    console.log('\n--- Metadata ---');
    console.log('Tokens usados:', response.usage);
    console.log('Modelo:', response.model);
    console.log('Stop reason:', response.choices[0]?.finish_reason);

  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
  }
}

main();