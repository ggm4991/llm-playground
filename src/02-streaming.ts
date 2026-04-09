// src/02-streaming.ts
import Groq from 'groq-sdk';
import * as dotenv from 'dotenv';

dotenv.config();

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function main() {
  console.log('Respuesta: ');

  const stream = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 1024,
    stream: true, // <- esto es todo lo que cambia
    messages: [
      {
        role: 'system',
        content: 'Eres un asistente experto en Angular. Responde siempre en español.'
      },
      {
        role: 'user',
        content: '¿Qué es el async pipe y por qué es mejor que suscribirse manualmente?'
      }
    ]
  });

  let totalTokens = 0;

  for await (const chunk of stream) {
    const token = chunk.choices[0]?.delta?.content ?? '';
    process.stdout.write(token); // escribe sin salto de línea, token a token
    
    if (chunk.x_groq?.usage) {
      totalTokens = chunk.x_groq.usage.total_tokens;
    }
  }

  console.log('\n\n--- Metadata ---');
  console.log('Total tokens:', totalTokens);
}

main();