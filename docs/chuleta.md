# Chuleta

Repaso rápido. Un vistazo por concepto, no explicaciones largas.

---

## Sesión 1 — Arranque Angular 22 (7 sep 2026)

### Zone.js vs zoneless

**Zone.js** parcheaba `setTimeout`, `addEventListener`, promesas y `fetch`. Cuando algo terminaba, avisaba a Angular sin saber el qué, y Angular revisaba el árbol entero por si acaso.

**Zoneless** quita ese avisador ciego. Ahora el aviso viene de fuentes concretas.

### Qué dispara change detection sin Zone.js

- Escribir en un `signal` que se lee en plantilla (`.set()`, `.update()`)
- `markForCheck()` — es lo que hace por dentro el `async` pipe
- Un evento enlazado en plantilla: `(click)`, `(input)`...
- Asignar un input basado en signals

Se marca el componente como sucio, un scheduler agrupa los avisos, y Angular recorre el árbol **revisando solo lo marcado**.

### La trampa que te van a poner

```ts
mensajes: string[] = [];
this.mensajes.push('hola');   // ❌ no repinta: nadie avisa

mensajes = signal<string[]>([]);
this.mensajes.update(m => [...m, 'hola']);   // ✅ el signal avisa
```

Con Zone.js el primero funcionaba. Sin Zone.js, no.

### Frase para entrevista

> Zone.js avisaba de todo sin saber de qué; los signals avisan de qué exactamente ha cambiado.

### Angular 22: qué cambió

- **Zoneless por defecto** desde v21 → no hace falta `provideZonelessChangeDetection()`. Solo se toca `app.config.ts` si quieres lo contrario: `provideZoneChangeDetection()`
- **Zone.js ni se instala**: no está en `package.json` ni en el bundle
- **OnPush es la estrategia por defecto** en v22 → la trampa de arriba es el comportamiento normal, no un caso raro
- `provideBrowserGlobalErrorListeners()` → captura `window.onerror` y promesas rechazadas y las mete por el `ErrorHandler` de Angular

---

## Entorno y herramientas

### nvm-windows

```bash
nvm install 24     # instala
nvm use 24         # activa (necesita terminal como ADMIN)
nvm list           # ver instaladas
```

Desinstala Node antes de instalar nvm, o hay conflictos. Terminal **nueva** y **como administrador** después de instalar.

`.nvmrc` en la raíz del proyecto = recordatorio de qué versión usa.

### ng sin instalación global

```bash
npx ng serve     # usa el CLI del proyecto
npm start        # lo mismo, ya viene mapeado
```

Mejor que instalarlo global: cada proyecto usa su propia versión.

---

## Git

### Sacar algo ya commiteado (sin borrarlo del disco)

```bash
git rm --cached .env           # un archivo
git rm -r --cached .           # reaplicar .gitignore a todo
git add .
git commit --amend --no-edit   # mete el arreglo en el commit anterior
```

`--amend` solo si **no has hecho push**.

### Verificar antes de comitear

```bash
git ls-files | findstr .env         # ¿está trackeado?
git ls-files | find /c /v ""        # ¿cuántos archivos? (miles = node_modules dentro)
git status                          # el .env NO debe aparecer nunca
```

### `.gitignore` en UTF-16 = invisible para git

Si `type .gitignore` muestra caracteres chinos, está en UTF-16 y **git no lo lee**. Por eso se coló `node_modules`.

Editar en VS Code y comprobar abajo a la derecha que pone **UTF-8**.

Mínimo para un proyecto Angular + Node:

```
node_modules/
dist/
.env
.angular/
```

### Repos desincronizados (dos máquinas)

Antes de tocar nada:

```bash
git fetch origin
git branch -r                    # ¿qué ramas hay en el remoto?
git log --oneline origin/main    # ¿qué hay allí?
git diff --stat HEAD origin/main # ¿qué difiere?
```

Si el remoto está más actualizado: **clonar limpio al lado** y mover tu trabajo nuevo dentro. Nunca forzar el push encima.

`git reset --soft <commit>` mueve la rama pero conserva tus archivos preparados. No pierdes nada.

---

## APIs

### El endpoint `/models` es la fuente de verdad

```bash
curl -s https://api.groq.com/openai/v1/models -H "Authorization: Bearer TU_CLAVE"
```

Más fiable que cualquier documentación. Los catálogos gratuitos se podan y un nombre de modelo puede desaparecer sin que tu código cambie.

Mira `supported_features` de cada modelo: si necesitas function calling, tiene que incluir `"tools"`.

Que aparezca `pricing` **no** significa que no esté en el free tier. El precio es lo que costaría en el tier de pago.

### Sintaxis de variables por shell

| | cmd | PowerShell |
|---|---|---|
| Variable | `%VAR%` | `$env:VAR` |
| curl | `curl` | `curl.exe` |

Y ojo: una variable del `.env` **no existe en la terminal**. La lee dotenv al arrancar el script.

### Pendiente

Sacar el identificador del modelo del código y meterlo en el `.env`. Cuando el proveedor retire un modelo, cambias configuración en vez de código.