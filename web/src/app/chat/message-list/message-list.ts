import { Component, input } from '@angular/core';
import { ChatMessage } from '../chat-message';
import { MessageItem } from '../message-item/message-item';

@Component({
  selector: 'app-message-list',
  templateUrl: './message-list.html',
  styleUrl: './message-list.scss',
  imports: [MessageItem]
})
export class MessageList {
  // TODO 1: input OBLIGATORIO `messages` de tipo ChatMessage[]
  readonly messages = input.required<ChatMessage[]>();
  // TODO 2: input `isThinking` opcional, false por defecto
  readonly isThinking = input<boolean>(false);

  protected copyRequested(text: string): void {
    console.log(text);
  }
}