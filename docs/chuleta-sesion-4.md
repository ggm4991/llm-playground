---

## Sesión 4 — `MessageItem`: computed, tipos y bugs silenciosos (23 sep 2026)

### El fallo que más me cuesta ver ⚠️⚠️

Los dos bugs de hoy compilan, no petan en consola y devuelven algo que no era lo que yo creía.

```ts
computed(() => { this.message().role === 'user' })   // ❌ devuelve undefined: llaves sin return
computed(() => this.message().role)                  // ❌ devuelve 'assistant' → truthy → clase mal
computed(() => this.message().role === 'user')       // ✅ booleano
```

**Hábito:** ante cada `computed`, preguntarme *¿qué tipo devuelve esto exactamente?* antes de darlo por bueno.
Si dudo, `computed<boolean>(...)` y que el compilador hable.

Arrow con llaves = cuerpo de función, necesita `return`. Sin llaves = la expresión *es* el valor.

### Qué se pasa a un hijo desde un `@for` ⚠️

```html
@for (msg of messages(); track msg.id) {
  <app-message-item [message]="msg" />   <!-- ✅ msg ya es un objeto -->
}
```

`messages()` ya se leyó en el `@for`. `msg` es un `ChatMessage` normal, no un signal, así que `msg()` da error.
Llamar a un signal no copia nada: **lee su valor actual**.

### Nombres

- `isX` promete un booleano. Si devuelve otra cosa, el nombre miente.
- Métodos = acciones: `requestCopy()`, no `copyButton()`.
- Outputs: evitar nombres de eventos nativos del DOM (`copy`, `select`, `change`) → `copyRequested`.

### Imports

Un import con `../../../../../` es una señal de alarma: el front no importa del backend.
Borrar imports sin usar antes de cada commit.

### Frase para entrevista

> Con signals los errores ya no son de change detection, son de tipos. Un `computed` que devuelve
> `undefined` o una cadena donde esperabas un booleano compila igual y falla en silencio.
