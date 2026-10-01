# Verificar microinteracciones

La fluidez no se prueba con E2E; que la microinteracción **ocurra, en el orden correcto y con el estado accesible correcto**, sí. Esta guía reúne técnicas probadas con Playwright y su justificación.

## Contenido

1. Qué verificar y qué no
2. Matriz de cobertura
3. Técnicas con código
4. Estabilidad (evitar pruebas frágiles)
5. Verificar un despliegue

---

## 1. Qué verificar y qué no

Verifica los **estados observables** que la microinteracción expone:

- **Atributos:** `aria-busy`, `inert`, `aria-pressed`, `aria-current`, `aria-invalid`, `data-state`, `data-*` de estado.
- **Estilos calculados al final de la transición:** `opacity`, `pointer-events`, `transition-property`, colores.
- **Animaciones WAAPI:** `element.getAnimations()` y su `playState`.
- **Ciclo de vida en el DOM:** el clon aparece y se retira; el diálogo y el velo desaparecen al cerrar.
- **Orden causal:** el contador mostraba el valor anterior mientras el clon volaba.
- **Texto y regiones vivas:** «Producto retirado.» dentro de `role="status"` y los errores en `role="alert"`.
- **Llamadas a APIs de plataforma:** `document.startViewTransition`, `navigator.share` y `clipboard`.

**No verifiques** duraciones exactas en milisegundos ni posiciones a mitad de la animación con tolerancias estrechas: dependen de la máquina y fallan por azar.

## 2. Matriz de cobertura

Al terminar, reporta por microinteracción (ID, título) una de estas categorías:

- **Verificada:** una prueba afirma la conducta misma.
- **En parte:** afirma una parte (por ejemplo, el rol del error pero no la pausa del toast).
- **Solo flujo:** la tarea funciona, pero la microinteracción no se comprueba.
- **Sin prueba.**

Di también por qué falta: requiere sesión o datos, la función está apagada o no es observable. "El flujo pasa" no equivale a "la microinteracción existe". Escribir la prueba específica destapó un morph que nunca ocurría.

## 3. Técnicas con código

### Retener una navegación para observar el estado pendiente

Retiene solo las peticiones RSC de navegación (no las de prefetch) hasta soltarlas, y suéltalas siempre en un `finally`.

```ts
async function holdNavigationRsc(page: Page, matches: (url: URL) => boolean) {
  let release!: () => void
  const released = new Promise<void>((resolve) => { release = resolve })
  let held = 0
  await page.route('**/*', async (route) => {
    const h = route.request().headers()
    const isNavigationRsc =
      h['rsc'] === '1' && !h['next-router-prefetch'] && !h['next-router-segment-prefetch']
    if (isNavigationRsc && matches(new URL(route.request().url()))) {
      held += 1
      await released
    }
    await route.continue().catch(() => undefined)
  })
  return { release: () => release(), heldCount: () => held }
}

const hold = await holdNavigationRsc(page, (u) => u.pathname === '/buscar')
try {
  await filterButton.click()
  await expect.poll(hold.heldCount).toBeGreaterThan(0)
  await expect(results).toHaveAttribute('aria-busy', 'true')
  await expect(results).toHaveCSS('opacity', '0.45')
} finally {
  hold.release()
}
```

Sirve para el Dimming de filtros, los skeletons por ruta y los estados «Confirmando…». En otros stacks, retiene la petición de datos equivalente.

### Esperar el prefetch antes de un clic (Next.js)

El fallback que se ve depende de si el enlace ya se precargó. Next aborta el stream en cuanto leyó lo que necesita, así que `requestfinished` puede no llegar nunca; cuenta también `requestfailed` e ignora la precarga del árbol (`/_tree`).

```ts
const prefetched = new Set<string>()
const mark = (r: Request) => {
  const h = r.headers()
  if (h['next-router-prefetch'] && h['next-router-segment-prefetch'] !== '/_tree') {
    prefetched.add(new URL(r.url()).pathname)
  }
}
page.on('requestfinished', mark)
page.on('requestfailed', mark)
await expect.poll(() => prefetched.has(target)).toBe(true)
```

`next dev` no precarga por viewport: salta estas pruebas cuando se corre contra el servidor de desarrollo.

### Orden causal con MutationObserver (vuelo al carrito)

```ts
await page.evaluate(() => {
  const w = window as any
  w.__flights = []
  new MutationObserver((records) => {
    for (const r of records) for (const n of r.addedNodes) {
      if (n instanceof HTMLElement && n.dataset.testid === 'cart-fly-clone') {
        w.__flights.push(document.querySelector('[data-testid="cart-count-badge"]')?.textContent)
      }
    }
  }).observe(document.body, { childList: true })
})
await addButton.click()
await expect.poll(() => page.evaluate(() => (window as any).__flights)).toEqual(['1']) // aún el valor viejo
await expect(badge).toHaveText('2')                                               // cambia al llegar
await expect(page.getByTestId('cart-fly-clone')).toHaveCount(0)                   // el clon se retira
```

### Valores intermedios (Value Change)

Registra los textos que toma el número y exige al menos uno distinto del inicial y del final.

```ts
await total.evaluate((el) => {
  const w = window as any; w.__totals = []
  new MutationObserver(() => w.__totals.push(el.textContent?.trim()))
    .observe(el, { characterData: true, childList: true, subtree: true })
})
```

### Dos capas coexistiendo (fundido cruzado)

Observa el máximo de `img` dentro de la tarjeta durante el cambio. Debe superar el inicial y volver a él.

### View Transitions realmente iniciadas

```ts
await page.addInitScript(() => {
  const w = window as any; w.__vt = []
  const original = document.startViewTransition?.bind(document)
  if (!original) return
  document.startViewTransition = ((...args: any[]) => {
    w.__vt.push(Array.from(document.querySelectorAll<HTMLElement>('*'))
      .map((e) => e.style.viewTransitionName).filter(Boolean))
    return original(...args)
  }) as typeof document.startViewTransition
})
// …navegar…
expect(transitions.flat().some((n) => n.startsWith('product-media-'))).toBe(true)
```

### Pausa del tiempo de un toast

```ts
const playStates = () => progress.evaluate((el) => el.getAnimations().map((a) => a.playState))
await expect.poll(playStates).toContain('running')
await toast.getByRole('button', { name: 'Deshacer' }).focus()
await expect.poll(playStates).toContain('paused')
```

### Tiempo real a mitad del gesto (CDP touch)

Envía `touchStart` y varios `touchMove` sin `touchEnd`, y lee el `translate3d` del carril. Debe estar desplazado antes de soltar. Solo funciona en Chromium.

### Compartir sin hoja nativa

```ts
await page.addInitScript(() => {
  Object.defineProperty(navigator, 'share', { value: undefined, configurable: true })
  Object.defineProperty(navigator, 'clipboard', { value: { writeText: async () => {} }, configurable: true })
})
```

### Movimiento reducido

`test.use({ contextOptions: { reducedMotion: 'reduce' } })`. Afirma que el clon nunca aparece y que llega la confirmación textual.

### Superposiciones y posición

Pollea la posición después de la entrada (la caja incluye el `transform` mientras entra):

```ts
await expect.poll(async () => {
  const [t, n] = await Promise.all([toast.boundingBox(), nav.boundingBox()])
  return n!.y - (t!.y + t!.height)
}).toBeGreaterThanOrEqual(-1)
```

## 4. Estabilidad

- **Datos:** descubre fixtures reales en solo lectura cuando baste (un producto con stock; elige la variante con más stock para no chocar con reservas). Si hay que escribir, crea y limpia, y pide permiso antes de hacerlo en entornos compartidos.
- **Selectores:**
  - evita los `.first()` que se re-resuelven tras el clic: fija el elemento por un id de datos;
  - filtra con `:visible` si hay duplicados ocultos (listas recortadas, versiones móvil y escritorio);
  - limita a `main` durante el streaming.
- **Pantallas con header oculto** (portadas con video): empieza la prueba en otra ruta.
- **Tiempos:** da margen a la retirada de skeletons en servidores lentos (`toHaveCount(0, { timeout: 20_000 })`) sin relajar la aserción.
- **Repite** (`--repeat-each=2`) antes de declarar estable una prueba nueva.
- **Agrupa por dependencia:** solo los describes que necesitan fixtures los descubren en `beforeAll`; si no, se saltan pruebas que no los usan.

## 5. Verificar un despliegue

1. Espera el deploy del SHA exacto y confirma que está asignado al dominio correcto.
2. Descarga las hojas CSS del HTML servido y busca los selectores nuevos (por ejemplo `.toast-viewport`).
3. Haz una pasada corta de solo lectura en el entorno: los estados clave (seleccionado, menú abierto, 404, skeleton) y alguna comprobación instrumentada (view transition).
4. Revisa los temas, los anchos (320, 390, 768, 1024, 1440) y el movimiento reducido.
5. No corras suites largas contra entornos compartidos sin permiso explícito.
