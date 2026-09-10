import { Component, computed, effect, signal } from '@angular/core';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const STORAGE_KEY = 'chat-history';

function loadHistory(): ChatMessage[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
}

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  // --- Estado fuente ---
  protected readonly messages = signal<ChatMessage[]>(loadHistory());
  protected readonly draft = signal('');
  protected readonly isThinking = signal(false);

  // --- Estado derivado ---
  // TODO 1: messageCount → número de mensajes
  messageCount = computed(() => this.messages().length);
  // TODO 2: canSend → true solo si draft (sin espacios) no está vacío Y no está pensando
  canSend = computed(() => this.draft().trim() !== '' && !this.isThinking());

  constructor() {
    // TODO 5: effect que guarde messages() en localStorage con STORAGE_KEY
    effect(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.messages()));
    });
  }

  protected send(): void {
    if (!this.canSend()) return;

    const text = this.draft().trim();
    // TODO 3: añade el mensaje del usuario a messages SIN mutar el array
    this.messages.update((msgs) => [...msgs, { id: crypto.randomUUID(), role: 'user', content: text }]);
    //         Pista: aquí toca update(), no set()

    this.draft.set('');
    this.isThinking.set(true);

    // Respuesta simulada del modelo (en S4 será HTTP real)
    setTimeout(() => {
      // TODO 4: añade la respuesta del assistant (p. ej. `Review de: "${text}"`)
      //         y vuelve a poner isThinking a false
      this.messages.update((msgs) => [...msgs, { id: crypto.randomUUID(), role: 'assistant', content: `Review de: "${text}"` }]);
      this.isThinking.set(false);
    }, 800);
  }
}