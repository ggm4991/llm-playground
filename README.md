# LLM Playground

Exploración progresiva de la integración con modelos de lenguaje (LLMs) usando TypeScript y la API de Groq. Cada archivo es un ejercicio autónomo que introduce un concepto nuevo, desde una llamada básica hasta un chatbot con tool use.

## Stack

- **Runtime**: Node.js + TypeScript
- **LLM Provider**: [Groq](https://groq.com/) — inferencia ultrarrápida sobre modelos open-source
- **Modelo**: `llama-3.3-70b-versatile`
- **Ejecución**: `tsx` (sin build step)
- **Tests**: `node:test` (runner nativo de Node 18+)

## Estructura

```
src/
├── 01-hello-groq.ts       # Llamada básica: request/response + metadata
├── 02-streaming.ts        # Streaming token a token con async iterators
├── 03-historial.ts        # Gestión manual de contexto conversacional
├── 04-chatbot.ts          # Chatbot completo: streaming + trim de historial + comandos
├── 05-tools.ts            # Function calling: el modelo invoca herramientas externas
└── __tests__/
    └── 04-chatbot.test.ts # Tests unitarios de lógica pura
```

## Progresión

### `01-hello-groq.ts` — Integración básica
Primera llamada a la API. Muestra la anatomía completa de una `ChatCompletion`: configuración del cliente, mensajes, y extracción de metadata (tokens, modelo, finish reason).

```bash
npx tsx src/01-hello-groq.ts
```

### `02-streaming.ts` — Streaming en tiempo real
Usa `stream: true` y `for await...of` para escribir tokens de forma incremental con `process.stdout.write`. Demuestra la diferencia entre latencia total y tiempo hasta el primer token (TTFT).

```bash
npx tsx src/02-streaming.ts
```

### `03-historial.ts` — Memoria conversacional
Los LLMs son stateless: la "memoria" la gestiona el cliente enviando el historial completo en cada request. Este archivo muestra el patrón fundamental antes de añadir abstracciones.

```bash
npx tsx src/03-historial.ts
```

### `04-chatbot.ts` — Chatbot production-ready
Integra todos los conceptos anteriores con decisiones de ingeniería reales:

- **Trim de historial** para no exceder la ventana de contexto
- **Streaming** como UX por defecto
- **Sistema de comandos** (`/help`, `/reset`, `/tokens`, `/history`)
- **Estado explícito** (`ChatState`) que hace las funciones testeables

```bash
npx tsx src/04-chatbot.ts
# o simplemente:
npm start
```

Comandos disponibles en el chatbot:

| Comando    | Descripción                              |
|------------|------------------------------------------|
| `/help`    | Lista de comandos disponibles            |
| `/reset`   | Reinicia la conversación                 |
| `/tokens`  | Tokens consumidos en la sesión           |
| `/history` | Número de mensajes en el historial       |
| `salir`    | Cierra el programa                       |

### `05-tools.ts` — Function Calling
Demuestra el ciclo completo de tool use en 3 turnos:
1. El modelo analiza el mensaje y decide qué herramientas invocar
2. El código ejecuta las herramientas y devuelve los resultados
3. El modelo genera la respuesta final con datos reales

Herramientas implementadas: `get_weather` y `calculate`.

```bash
npx tsx src/05-tools.ts
```

## Tests

```bash
npm test
```

Tests unitarios sobre `trimHistory` y `handleCommand` de `04-chatbot.ts`. Sin mocks de red, sin dependencias externas — solo lógica pura verificable.

## Setup

```bash
# 1. Instalar dependencias
npm install

# 2. Crear .env con tu API key de Groq
echo "GROQ_API_KEY=tu_clave_aqui" > .env

# 3. Ejecutar cualquier ejemplo
npx tsx src/05-tools.ts
```

Obtén tu API key gratuita en [console.groq.com](https://console.groq.com).
