import { Component, computed, input, model, output } from '@angular/core';

@Component({
  selector: 'app-chat-input',
  templateUrl: './chat-input.html',
  styleUrl: './chat-input.scss',
})
export class ChatInput {
  readonly disabled = input(false);
  readonly send = output<string>();

  readonly draft = model('');
  protected readonly canSend = computed(() => {
    return !this.disabled() && this.draft().trim() !== '';
  });

  protected submit(): void {
    if (!this.canSend()) {
      return;
    }
    this.send.emit(this.draft().trim());
    this.draft.set('');
  }
}
