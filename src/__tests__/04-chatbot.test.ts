// src/__tests__/04-chatbot.test.ts
// Tests unitarios usando el módulo nativo node:test (sin dependencias extra)
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// Las funciones están exportadas desde 04-chatbot tras el refactor
import {
  trimHistory,
  handleCommand,
  SYSTEM_PROMPT,
  type Message,
  type ChatState
} from '../04-chatbot.js';

// Helper para crear un estado limpio en cada test
function makeState(overrides: Partial<ChatState> = {}): ChatState {
  return {
    messages: [{ role: 'system', content: SYSTEM_PROMPT }],
    totalTokensUsed: 0,
    systemPrompt: SYSTEM_PROMPT,
    ...overrides
  };
}

// Helper para generar mensajes de conversación
function makeConversation(turns: number): Message[] {
  const msgs: Message[] = [{ role: 'system', content: SYSTEM_PROMPT }];
  for (let i = 0; i < turns; i++) {
    msgs.push({ role: 'user', content: `pregunta ${i}` });
    msgs.push({ role: 'assistant', content: `respuesta ${i}` });
  }
  return msgs;
}

describe('trimHistory', () => {
  it('no recorta si el historial está dentro del límite', () => {
    const messages = makeConversation(5); // 11 mensajes (system + 10)
    const result = trimHistory(messages, 20);
    assert.equal(result.length, messages.length);
    assert.equal(result, messages); // misma referencia: no hay copia
  });

  it('recorta cuando supera el límite', () => {
    const messages = makeConversation(15); // 31 mensajes (system + 30)
    const result = trimHistory(messages, 20);
    // Debe quedar: 1 system + 20 recientes
    assert.equal(result.length, 21);
  });

  it('siempre conserva el system prompt en la primera posición', () => {
    const messages = makeConversation(15);
    const result = trimHistory(messages, 10);
    assert.equal(result[0]!.role, 'system');
    assert.equal(result[0]!.content, SYSTEM_PROMPT);
  });

  it('conserva los mensajes más recientes al recortar', () => {
    const messages = makeConversation(15); // 31 mensajes
    const result = trimHistory(messages, 10);
    // El último mensaje del original debe estar al final del resultado
    const lastOriginal = messages[messages.length - 1]!;
    const lastResult = result[result.length - 1]!;
    assert.equal(lastResult.content, lastOriginal.content);
  });

  it('no recorta exactamente en el límite', () => {
    // maxHistory=20, messages.length=21 (system + 20 msgs) → no debe recortar
    const messages = makeConversation(10); // 21 mensajes
    const result = trimHistory(messages, 20);
    assert.equal(result.length, 21);
  });
});

describe('handleCommand', () => {
  let state: ChatState;

  beforeEach(() => {
    state = makeState();
  });

  it('/help devuelve true', () => {
    assert.equal(handleCommand('/help', state), true);
  });

  it('/reset devuelve true y reinicia los mensajes', () => {
    state.messages.push({ role: 'user', content: 'hola' });
    state.messages.push({ role: 'assistant', content: 'hola' });
    state.totalTokensUsed = 500;

    const result = handleCommand('/reset', state);

    assert.equal(result, true);
    assert.equal(state.messages.length, 1);
    assert.equal(state.messages[0]!.role, 'system');
    assert.equal(state.totalTokensUsed, 0);
  });

  it('/tokens devuelve true', () => {
    assert.equal(handleCommand('/tokens', state), true);
  });

  it('/history devuelve true', () => {
    assert.equal(handleCommand('/history', state), true);
  });

  it('comando desconocido devuelve false', () => {
    assert.equal(handleCommand('/foo', state), false);
    assert.equal(handleCommand('hola', state), false);
    assert.equal(handleCommand('', state), false);
  });

  it('los comandos son case-insensitive', () => {
    assert.equal(handleCommand('/HELP', state), true);
    assert.equal(handleCommand('/Reset', state), true);
  });
});
