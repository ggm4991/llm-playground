---

## Sesión 5 — `linkedSignal`, `model()` y comunicación entre hermanos (25 sep 2026)

### El fallo que se repite ⚠️⚠️⚠️ (tercera vez)

Los dos errores de hoy en `canSend`, juntos, y **ninguno da error de compilación**:

```ts
computed(() => { !this.disabled && ... });   // ❌ llaves sin return → undefined
if (!this.canSend) { ... }                   // ❌ sin () → la función, siempre truthy → la guarda nunca salta
```

**Regla mecánica: el paréntesis va pegado al nombre del signal, siempre.**
Un signal sin `()` es un objeto función: truthy, legal para TypeScript, y silencioso.

### `linkedSignal`

Escribible como un `signal`, pero **se reinicia cuando cambia su fuente**, como un `computed`.

```ts
protected readonly isExpanded = linkedSignal({
  source: () => this.message(),      // cuando cambie esto...
  computation: () => false,          // ...vuelve a este valor
});
```

Para estado local del usuario que debe resetearse al cambiar el contexto: un desplegable que se
pliega al cambiar de elemento, una fila seleccionada que se limpia al cambiar de página.

Cómo elegir:
- ¿Alguien lo escribe? No → `computed`
- Sí, ¿y debe resetearse solo cuando cambia algo de fuera? No → `signal` · Sí → `linkedSignal`

### `model()`

Input + output empaquetados. Habilita `[(banana in a box)]` y evita declarar el `emit` a mano.

```ts
readonly draft = model('');         // hijo: draft() y draft.set('x')
<app-chat-input [(draft)]="draft" />  // padre
```

⚠️ **En el componente raíz no tiene sentido**: no hay padre que lo enlace. Ahí es un `signal`.

### Lifting state up

Los hermanos no se hablan. El evento sube al ancestro común y el padre reparte.

`MessageItem` (editar) → `MessageList` lo reemite → `App` rellena `draft` → `[(draft)]` → `ChatInput`

No es una contradicción con "el estado vive en el componente más bajo": es que ahora
**el más bajo que lo necesita** es el ancestro común de los dos.

### Un hijo nunca muta lo que recibe

`input()` impide reasignar el signal, **no** mutar el objeto de dentro: es la misma referencia que
tiene el padre. Si lo mutas, el signal del padre no se entera (misma referencia del array) y los
`computed` y `effect` se quedan desfasados. El hijo emite; el padre actualiza con un array nuevo.

### Convenciones

- Outputs: hecho consumado → `copyRequested`, `editRequested`
- Manejadores: `on` delante → `onCopyRequested()`
- Métodos = acciones → `toggleExpanded()`
- Nada de `CommonModule`: `@if` / `@for` son del compilador desde v17
- `!==`, nunca `!=`. Guarda temprana sin `else`. Sin anotar tipos que ya se infieren.

### Frase para entrevista

> `linkedSignal` es escribible como un `signal` pero tiene una fuente que lo reinicia, como un
> `computed`: estado local que debe resetearse al cambiar el contexto. Y `model()` empaqueta el
> input y el output del binding bidireccional en una sola declaración.
