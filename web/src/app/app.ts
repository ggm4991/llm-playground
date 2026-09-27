import { Component, computed, effect, inject, signal } from '@angular/core';
import { ChatMessage } from './chat/chat-message';
import { ChatInput } from './chat/chat-input/chat-input';
import { MessageList } from './chat/message-list/message-list';
import { ChatService } from './chat/chat-service';
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
  private readonly chatService = inject(ChatService);
  // --- Estado fuente ---
  protected readonly messages = signal<ChatMessage[]>(loadHistory());
  protected readonly isThinking = signal(false);
  protected readonly draft = signal('');
  protected readonly errorMessage = signal<string | null>(null);
  // --- Estado derivado ---
  protected readonly messageCount = computed(() => this.messages().length);
  constructor() {
    effect(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.messages()));
    });
  }

  private addMessage(role: ChatMessage['role'], content: string): void {
    this.messages.update((msgs) => [...msgs, { id: crypto.randomUUID(), role, content }]);
  }

  protected send(text: string): void {
    this.errorMessage.set(null);

    this.addMessage('user', text);

    this.isThinking.set(true);

    this.chatService
      .sendMessage(this.messages())
      .then((response) => {
        this.addMessage('assistant', response.content);
      })
      .catch((error) => {
        console.log(error);
        this.errorMessage.set('No se pudo contactar con el modelo');
      })
      .finally(() => this.isThinking.set(false));
  }

  protected editMessage(text: string) {
    this.draft.set(text);
  }
}
