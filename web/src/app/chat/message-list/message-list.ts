import { Component, input, output } from '@angular/core';
import { ChatMessage } from '../chat-message';
import { MessageItem } from '../message-item/message-item';

@Component({
  selector: 'app-message-list',
  templateUrl: './message-list.html',
  styleUrl: './message-list.scss',
  imports: [MessageItem]
})
export class MessageList {
  readonly editRequested = output<string>();

  // TODO 1: input OBLIGATORIO `messages` de tipo ChatMessage[]
  readonly messages = input.required<ChatMessage[]>();
  // TODO 2: input `isThinking` opcional, false por defecto
  readonly isThinking = input<boolean>(false);

  protected onCopyRequested(text: string): void {
    console.log(text);
  }

  protected onEditRequested(text: string): void {
    this.editRequested.emit(text);
  }
}