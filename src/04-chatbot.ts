// src/04-chatbot.ts
import Groq from 'groq-sdk';
import * as dotenv from 'dotenv';
import * as readline from 'readline';

dotenv.config();

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const SYSTEM_PROMPT = `Eres un asistente experto en Angular y TypeScript.
Responde siempre en español. Sé conciso y práctico.
Cuando muestres código, usa ejemplos reales y útiles.`;

export const MAX_HISTORY_MESSAGES = 20;

export type Message = { role: 'user' | 'assistant' | 'system'; content: string };

export type ChatState = {
  messages: Message[];
  totalTokensUsed: number;
  systemPrompt: string;
};

// Función pura: recibe el historial y devuelve uno recortado si es necesario
export function trimHistory(messages: Message[], maxHistory = MAX_HISTORY_MESSAGES): Message[] {
  if (messages.length > maxHistory + 1) {
    const systemPrompt = messages[0]!;
    const recentMessages = messages.slice(-maxHistory);
    console.log('\n⚠️  Historial recortado para no exceder el contexto.\n');
    return [systemPrompt, ...recentMessages];
  }
  return messages;
}

function printHelp(): void {
  console.log(`
Comandos disponibles:
  /help    → muestra esta ayuda
  /reset   → reinicia la conversación
  /tokens  → muestra tokens consumidos en esta sesión
  /history → muestra cuántos mensajes hay en el historial
  salir    → termina el programa
  `);
}

export function handleCommand(input: string, state: ChatState): boolean {
  switch (input.toLowerCase()) {
    case '/help':
      printHelp();
      return true;
    case '/reset':
      state.messages = [{ role: 'system', content: state.systemPrompt }];
      state.totalTokensUsed = 0;
      console.log('\n✅ Conversación reiniciada.\n');
      return true;
    case '/tokens':
      console.log(`\n📊 Tokens consumidos esta sesión: ${state.totalTokensUsed}\n`);
      return true;
    case '/history':
      console.log(`\n📝 Mensajes en historial: ${state.messages.length - 1} (sin contar system prompt)\n`);
      return true;
    default:
      return false;
  }
}

async function chat(userInput: string, state: ChatState): Promise<void> {
  state.messages.push({ role: 'user', content: userInput });
  state.messages = trimHistory(state.messages);

  process.stdout.write('\nAsistente: ');

  const stream = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 1024,
    stream: true,
    messages: state.messages
  });

  let fullResponse = '';

  for await (const chunk of stream) {
    const token = chunk.choices[0]?.delta?.content ?? '';
    process.stdout.write(token);
    fullResponse += token;

    if (chunk.x_groq?.usage) {
      state.totalTokensUsed += chunk.x_groq.usage.total_tokens;
    }
  }

  console.log('\n');
  state.messages.push({ role: 'assistant', content: fullResponse });
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const state: ChatState = {
    messages: [{ role: 'system', content: SYSTEM_PROMPT }],
    totalTokensUsed: 0,
    systemPrompt: SYSTEM_PROMPT
  };

  console.log('╔════════════════════════════════╗');
  console.log('║   Chatbot Angular - v1.0       ║');
  console.log('║   Escribe /help para comandos  ║');
  console.log('╚════════════════════════════════╝\n');

  const askQuestion = () => {
    rl.question('Tú: ', async (input) => {
      const userInput = input.trim();

      if (!userInput) {
        askQuestion();
        return;
      }

      if (userInput.toLowerCase() === 'salir') {
        console.log(`\nHasta luego. Tokens totales usados: ${state.totalTokensUsed}`);
        rl.close();
        return;
      }

      if (userInput.startsWith('/')) {
        const handled = handleCommand(userInput, state);
        if (!handled) {
          console.log(`\nComando desconocido. Escribe /help para ver los disponibles.\n`);
        }
        askQuestion();
        return;
      }

      try {
        await chat(userInput, state);
      } catch (error) {
        console.error('\n❌ Error:', error instanceof Error ? error.message : String(error), '\n');
      }

      askQuestion();
    });
  };

  askQuestion();
}

main();
