import { Component, computed, input, output } from '@angular/core';
import { ChatMessage } from '../chat-message';

@Component({
  selector: 'app-message-item',
  styleUrl: './message-item.scss',
  templateUrl: './message-item.html',
})
export class MessageItem {
  readonly message = input.required<ChatMessage>();
  readonly maxLength = input(200);
  readonly copyRequested = output<string>();


  protected readonly isUser = computed<boolean>(()=>{
    return this.message().role === 'user';
  });
  
  protected readonly preview = computed(()=>{
    return this.message().content.length > this.maxLength() ? 
    this.message().content.slice(0, this.maxLength())+"..." : 
    this.message().content;
  });

  protected onCopyClick() {
    this.copyRequested.emit(this.message().content)
  }

  
}