import { Component, computed, input, linkedSignal, output } from '@angular/core';
import { ChatMessage } from '../chat-message';

@Component({
  selector: 'app-message-item',
  styleUrl: './message-item.scss',
  templateUrl: './message-item.html'
})
export class MessageItem {
  readonly message = input.required<ChatMessage>();
  readonly maxLength = input(200);
  readonly copyRequested = output<string>();
  readonly editRequested = output<string>();
  
  protected readonly isExpanded = linkedSignal({
    source: () => this.message(),
    computation: () => false,
  });

  protected toggleExpanded() {
    this.isExpanded.update(value => !value);
  }

  protected readonly isUser = computed<boolean>(()=>{
    return this.message().role === 'user';
  });

  protected readonly isMaxLength = computed(()=>{
    return this.message().content.length > this.maxLength();
  });
  
  protected readonly preview = computed(()=>{
    return !this.isExpanded() && this.isMaxLength() ?
    this.message().content.slice(0, this.maxLength())+"..." : 
    this.message().content;
  });

  protected onCopyClick() {
    this.copyRequested.emit(this.message().content);
  }

  protected onEditClick() {
    this.editRequested.emit(this.message().content)
  }

}