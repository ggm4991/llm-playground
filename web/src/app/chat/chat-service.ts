import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ChatMessage } from './chat-message';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly http = inject(HttpClient);
  sendMessage(messages: ChatMessage[]): Promise<{ content: string }> {
    return firstValueFrom(
      this.http.post<{ content: string }>('/api/chat', { messages: messages.map(({ role, content }) => ({ role, content })) })
    );
  }
}
