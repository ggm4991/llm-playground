// src/05-tools.ts
// Demuestra "function calling" (tool use): el modelo decide cuándo llamar
// a una herramienta externa y nosotros ejecutamos la lógica real.
import Groq from 'groq-sdk';
import * as dotenv from 'dotenv';

dotenv.config();

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

// --- Definición de herramientas ---
// Le decimos al modelo qué herramientas existen y qué parámetros aceptan
const tools: Groq.Chat.Completions.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'get_weather',
      description: 'Obtiene el clima actual de una ciudad',
      parameters: {
        type: 'object',
        properties: {
          city: {
            type: 'string',
            description: 'Nombre de la ciudad, ej: "Madrid"'
          },
          unit: {
            type: 'string',
            enum: ['celsius', 'fahrenheit'],
            description: 'Unidad de temperatura'
          }
        },
        required: ['city']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'calculate',
      description: 'Evalúa una expresión matemática simple',
      parameters: {
        type: 'object',
        properties: {
          expression: {
            type: 'string',
            description: 'Expresión matemática, ej: "15 * 4 + 7"'
          }
        },
        required: ['expression']
      }
    }
  }
];

// --- Implementación real de las herramientas ---
// En producción aquí llamarías a una API de clima, base de datos, etc.
function get_weather(city: string, unit: 'celsius' | 'fahrenheit' = 'celsius'): string {
  // Simulación — en producción usarías fetch() a una API real
  const fakeData: Record<string, number> = {
    madrid: 22,
    barcelona: 24,
    'buenos aires': 18,
    'new york': 15
  };

  const tempCelsius = fakeData[city.toLowerCase()] ?? 20;
  const temp = unit === 'fahrenheit' ? (tempCelsius * 9) / 5 + 32 : tempCelsius;

  return JSON.stringify({ city, temperature: temp, unit, condition: 'Soleado' });
}

function calculate(expression: string): string {
  try {
    // Usamos Function en lugar de eval para un scope limpio
    // Solo permitimos expresiones con números y operadores básicos
    if (!/^[\d\s+\-*/().]+$/.test(expression)) {
      return JSON.stringify({ error: 'Expresión no permitida' });
    }
    const result = new Function(`return ${expression}`)() as number;
    return JSON.stringify({ expression, result });
  } catch {
    return JSON.stringify({ error: 'No se pudo evaluar la expresión' });
  }
}

// Despacha la llamada a la función correcta según lo que pida el modelo
function executeTool(name: string, args: Record<string, string>): string {
  switch (name) {
    case 'get_weather':
      return get_weather(args['city'] ?? '', (args['unit'] as 'celsius' | 'fahrenheit') ?? 'celsius');
    case 'calculate':
      return calculate(args['expression'] ?? '');
    default:
      return JSON.stringify({ error: `Herramienta desconocida: ${name}` });
  }
}

async function main() {
  const userMessage = '¿Cuánto es 127 * 34? Y también dime el clima en Madrid en Celsius.';

  console.log('Usuario:', userMessage);
  console.log('\n--- Turno 1: el modelo decide qué herramientas usar ---\n');

  const messages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'user', content: userMessage }
  ];

  // Primera llamada: el modelo responde con tool_calls en lugar de texto
  const firstResponse = await client.chat.completions.create({
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    messages,
    tools,
    tool_choice: 'auto' // el modelo decide si usar herramientas o no
  });

  const assistantMessage = firstResponse.choices[0]?.message;
  if (!assistantMessage) throw new Error('Sin respuesta del modelo');

  console.log('Stop reason:', firstResponse.choices[0]?.finish_reason);
  console.log('Tool calls solicitados:', assistantMessage.tool_calls?.length ?? 0);

  // Si el modelo no pidió herramientas, mostramos la respuesta directa
  if (!assistantMessage.tool_calls?.length) {
    console.log('\nRespuesta directa:', assistantMessage.content);
    return;
  }

  // Añadimos la respuesta del asistente al historial
  messages.push(assistantMessage);

  console.log('\n--- Turno 2: ejecutamos las herramientas y devolvemos resultados ---\n');

  // Ejecutamos cada tool_call y añadimos los resultados al historial
  for (const toolCall of assistantMessage.tool_calls) {
    const args = JSON.parse(toolCall.function.arguments) as Record<string, string>;
    const result = executeTool(toolCall.function.name, args);

    console.log(`✅ ${toolCall.function.name}(${toolCall.function.arguments})`);
    console.log(`   → ${result}\n`);

    messages.push({
      role: 'tool',
      tool_call_id: toolCall.id,
      content: result
    });
  }

  console.log('--- Turno 3: el modelo genera la respuesta final con los datos ---\n');

  // Segunda llamada: el modelo ya tiene los resultados y genera texto
  const finalResponse = await client.chat.completions.create({
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    messages,
    tools
  });

  console.log('Asistente:', finalResponse.choices[0]?.message.content);
  console.log('\n--- Metadata ---');
  console.log('Tokens totales:', finalResponse.usage?.total_tokens);
}

main();
