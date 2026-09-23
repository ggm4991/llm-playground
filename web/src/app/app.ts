import { Component, computed, effect, signal } from '@angular/core';
import { ChatMessage } from './chat/chat-message';
import { ChatInput } from './chat/chat-input/chat-input';
import { MessageList } from './chat/message-list/message-list';
const STORAGE_KEY = 'chat-history';

function loadHistory(): ChatMessage[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
}

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  imports: [ChatInput, MessageList],
})
export class App {
  // --- Estado fuente ---
  protected readonly messages = signal<ChatMessage[]>(loadHistory());
  protected readonly isThinking = signal(false);

  // --- Estado derivado ---
  // TODO 1: messageCount → número de mensajes
  protected readonly messageCount = computed(() => this.messages().length);
  constructor() {
    // TODO 5: effect que guarde messages() en localStorage con STORAGE_KEY
    effect(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.messages()));
    });
  }

  private addMessage(role: ChatMessage['role'], content: string): void {
    this.messages.update((msgs) => [...msgs, { id: crypto.randomUUID(), role, content }]);
  }

  protected send(text: string): void {
    // TODO 3: añade el mensaje del usuario a messages SIN mutar el array
    this.addMessage('user', text);

    this.isThinking.set(true);

    // Respuesta simulada del modelo (en S4 será HTTP real)
    setTimeout(() => {
      // TODO 4: añade la respuesta del assistant (p. ej. `Review de: "${text}"`)
      //         y vuelve a poner isThinking a false
      this.addMessage('assistant', `Review de: "${text}"`);
      this.isThinking.set(false);
    }, 800);
  }
}