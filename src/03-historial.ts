// src/03-conversation.ts
import Groq from 'groq-sdk';
import * as dotenv from 'dotenv';
import * as readline from 'readline';

dotenv.config();

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// El historial es simplemente un array que crece con cada turno
const messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [
  {
    role: 'system',
    content: 'Eres un asistente experto en Angular y TypeScript. Responde siempre en español. Sé conciso.'
  }
];

async function chat(userInput: string): Promise<string> {
  // 1. Añadimos el mensaje del usuario al historial
  messages.push({ role: 'user', content: userInput });

  // 2. Enviamos TODO el historial en cada llamada
  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 1024,
    messages
  });

  const assistantMessage = response.choices[0]?.message?.content ?? '';

  // 3. Añadimos la respuesta del modelo al historial
  messages.push({ role: 'assistant', content: assistantMessage });

  return assistantMessage;
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('Chatbot Angular listo. Escribe "salir" para terminar.\n');

  const askQuestion = () => {
    rl.question('Tú: ', async (input) => {
      const userInput = input.trim();

      if (userInput.toLowerCase() === 'salir') {
        console.log(`\nConversación terminada. Total de mensajes: ${messages.length}`);
        rl.close();
        return;
      }

      if (!userInput) {
        askQuestion();
        return;
      }

      const response = await chat(userInput);
      console.log(`\nAsistente: ${response}\n`);

      askQuestion(); // siguiente turno
    });
  };

  askQuestion();
}

main();