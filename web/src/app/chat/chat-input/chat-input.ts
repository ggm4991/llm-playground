import { Component, computed, Input, input, InputSignal, output, OutputEmitterRef, signal } from '@angular/core';

@Component({
  selector: 'app-chat-input',
  templateUrl: './chat-input.html',
  styleUrl: './chat-input.scss',
})
export class ChatInput {
  // TODO 3: input `disabled` (boolean, false por defecto)
 readonly disabled: InputSignal<boolean> = input(false);
  // TODO 4: output `send` que emite un string
readonly send: OutputEmitterRef<string> = output<string>();

  protected readonly draft = signal('');
  // TODO 5: canSend → draft sin espacios no vacío Y no disabled
protected readonly canSend = computed(() =>{ 
!this.disabled && (this.draft().trim() != '')});

  
  protected submit(): void {
    // TODO 6: si no puede enviar, return
    if (!this.canSend){
      return;
    }
    else{
      this.send.emit(this.draft().trim())
      this.draft.set('')
    }
     
  }
}