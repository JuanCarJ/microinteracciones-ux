# Lecciones de implementación (React, Next.js, framer-motion)

Fallos reales encontrados al llevar microinteracciones a producción. Cada uno describe el síntoma que ve el usuario, la causa y la solución. Léelo antes de implementar y vuelve aquí cuando algo "debería verse pero no se ve".

## Contenido

1. Arquitectura: tokens y primitivas
2. Salidas que se traban (AnimatePresence)
3. Skeletons que envuelven la ruta equivocada (`loading.tsx`)
4. View Transitions sin pareja
5. Vuelo al carrito y contador que espera
6. Deshacer, toasts y regiones vivas
7. Totales y sincronización
8. Formularios con validación en vivo
9. Temas que borran estados
10. Barras fijas y superposiciones
11. El build publicó CSS viejo
12. Copy y accesibilidad textual
13. Movimiento reducido
14. Proceso: auditar, integrar y verificar

---

## 1. Arquitectura: tokens y primitivas

- Un módulo de motion (por ejemplo `src/lib/motion.ts`) exporta:
  - las curvas, como arrays para framer-motion y como strings CSS para WAAPI;
  - las duraciones por intención (`overlay`, `drawer`, `modal`, `state`, `badge`, `toast`, `reveal`, `value`, `collapse`, `confirm`);
  - el escalonado con tope (`staggerDelay(i) = min(i, 8) * 40ms`);
  - `prefersReducedMotion()`.
- Construye primitivas reutilizables antes de tocar pantallas: `Toast` (con acción, duración, progreso y pausa), `AnimatedNumber`, `CollapsibleRegion`, `SwapText`, `useTransientFlag`, `flyToCart` y `CartIndicator`.
- Documenta cada decisión de motion en el contrato de diseño del proyecto (por ejemplo, una tabla en `DESIGN.md`) para que no se reabra en cada PR.

## 2. Salidas que se traban (AnimatePresence)

- **Síntoma:** después de navegar con el drawer o el menú abierto, queda un velo invisible que bloquea toda la página. No se ve, pero no deja hacer clic.
- **Causa:** `AnimatePresence` espera a que termine la animación de salida para desmontar; si el árbol cambia a mitad (una navegación), la salida puede no completarse nunca.
- **Solución:** desmontaje determinista:
  - calcula `isMounted` durante el render: se monta al abrir y se mantiene durante una fase de cierre;
  - en la fase de cierre aplica `inert`, `aria-hidden` y `pointer-events: none` para que no bloquee nada;
  - desmonta con un temporizador fijo (la duración de salida más un margen);
  - el velo dura más que el panel usando una duración mayor, no un retraso de salida.
- **Verificación:** tras cerrar, el diálogo y el velo tienen `count = 0`.

## 3. Skeletons que envuelven la ruta equivocada (`loading.tsx`)

- **Síntoma:** al abrir una ficha de producto desde el catálogo aparece el skeleton de la **categoría** (una grilla) y luego la ficha.
- **Causa:** en el App Router, `loading.tsx` envuelve la página de su carpeta **y todas sus rutas hijas**. `[categoria]/loading.tsx` envolvía también `[categoria]/[slug]`.
- **Solución:** mueve la página y el skeleton del padre a un route group (`[categoria]/(listado)/page.tsx` y `loading.tsx`). La URL no cambia, y la ruta hija usa su propio `[slug]/loading.tsx`. Añade un contrato de CI que impida que vuelva a existir `[categoria]/loading.tsx`.

Otras lecciones de carga:

- **El `app/loading.tsx` raíz puede ser obligatorio:** si el layout usa `useSearchParams` (navbar, menú), quitarlo rompe el build con un error de prerender. Conviértelo en una silueta del sitio (header, título y tarjetas) en lugar de eliminarlo.
- **Qué fallback se ve depende del prefetch:** Next precarga los enlaces visibles hasta el primer loading boundary (solo en producción; `next dev` no precarga). Si el clic llega antes de la precarga, se ve el boundary exterior (la silueta genérica).
- **Un solo `role="status"` por skeleton** con texto específico («Cargando producto…»); los bloques de shimmer son `aria-hidden`.
- **Durante el streaming pueden coexistir ids duplicados** (el skeleton y el contenido); en las pruebas, limita los selectores a `main`.

## 4. View Transitions sin pareja

- **Síntoma:** el morph de la tarjeta a la galería "está implementado", pero nunca ocurre. Instrumentado, `startViewTransition` se llamaba 0 veces.
- **Causa:** React empareja dos `<ViewTransition name>` iguales solo si uno sale y el otro entra **en el mismo commit**. Con `default="none"`, una salida o entrada sin pareja no anima, y React ni siquiera inicia la transición. Si la ruta de destino muestra antes un skeleton, la tarjeta sale contra el skeleton (commit 1) y la galería entra contra el skeleton (commit 2): nunca hay pareja.
- **Solución (nombre pendiente):**
  1. al hacer clic, la tarjeta deja `{ name, path }` en un pequeño store del módulo (`useSyncExternalStore`);
  2. el marco de la galería en el skeleton de la ficha usa ese nombre **solo si `usePathname() === path`**; así, una navegación cancelada o fallida no se lo pasa a otro producto;
  3. la ficha real limpia el pendiente al montarse;
  4. los clics con Ctrl, Cmd, Shift o Alt no dejan pendiente (abren otra pestaña);
  5. resultado: tarjeta → skeleton → galería, dos transiciones emparejadas.
- **Más reglas:**
  - nombres únicos en pantalla: solo las grillas del catálogo nombran sus tarjetas; relacionados, vistos y destacados no;
  - no hace falta ninguna opción en `next.config`: en Next 16 las navegaciones ya son transiciones;
  - `Link` con `unstable_dynamicOnHover` y `experimental.dynamicOnHover` precarga completo al pasar el cursor, pero no garantiza la pareja; el skeleton con nombre sí.

## 5. Vuelo al carrito y contador que espera

- El clon es `position: fixed` en el body y vuela con WAAPI en arco. Emite `fly-start` (el contador retiene su número) y `fly-arrived` (lo suelta). Ten un tope (unos 900 ms) por si nunca llega.
- `flyToCart` devuelve `false` si no hay un destino **visible** (mide el rectángulo, el viewport y `checkVisibility`) o si se pidió menos movimiento. En ese caso, el llamador confirma con texto.
- **Modo adaptativo:** la primera adición de la sesión abre el panel (enseña dónde quedó); las siguientes vuelan. La memoria vive en `sessionStorage`.
- En ciertos anchos el ícono del carrito puede no existir en el header: comprueba cada punto de quiebre y ten un fallback.

## 6. Deshacer, toasts y regiones vivas

- **API de toast:**
  - `{ id, duration (null = persistente), action: { label, onClick }, onDismiss(reason) }`, con `reason` en `timeout`, `close`, `action` o `evicted`;
  - el id reemplaza en lugar de apilar;
  - `toast.dismiss(id)`.
- **Regiones:**
  - los errores se renderizan en `role="alert"` y persisten;
  - el resto va en `role="status"`;
  - las pruebas que buscaban el error en `status` tuvieron que cambiar a `alert`.
- **Progreso:** una barra de tiempo con WAAPI que se pausa con `pointerenter` o `focus` y se reanuda al salir; así puedes apuntar a «Deshacer» sin que desaparezca.
- **Posición:** en móvil, por encima de la navegación inferior. En un deploy, el CSS que posicionaba el viewport no llegó (ver 11) y el aviso de Deshacer quedó fuera de pantalla.
- **Borrado en servidor diferido:** borra al vencer la ventana y cancela si se deshace. Las pruebas necesitan esperar dos ventanas cuando hay varios borrados y alejar el mouse del toast (la pausa por hover alarga la espera).

## 7. Totales y sincronización

- `AnimatedNumber` interpola con `requestAnimationFrame` y termina siempre en el valor exacto. Con movimiento reducido salta directo.
- Durante la sincronización con el servidor, conserva el último carrito resuelto: no muestres 0 ni borres el descuento. Marca como pendientes solo las líneas tocadas (`pendingLines`) con `aria-busy`.
- Serializa las mutaciones persistentes y verifica que la sesión dueña no cambió antes de aplicar la respuesta (evita escribir el carrito de otro usuario tras un logout).
- Un error de sincronización se muestra con un id fijo (reemplaza, no apila).

## 8. Formularios con validación en vivo

- Valida en `blur` y revalida en `input` una vez que hubo error; el mensaje entra con un fundido de 150 ms. El estado válido (check) es opcional por campo.
- El error del servidor se descarta cuando el usuario corrige, pero **se reinicia en cada envío**: si no, un error repetido no vuelve a verse.
- Al enviar con errores, enfoca el primer inválido y conserva todo lo escrito.
- Mover el marcado de ayudas (por ejemplo, el texto de la contraseña) puede romper contratos o pruebas que lo buscaban: actualízalos en el mismo cambio.

## 9. Temas que borran estados

- **Síntoma:** en el tema oscuro de la tienda, la talla seleccionada se veía igual que las demás.
- **Causa:** el tema remapea utilidades con `!important` (`bg-black` a negro, `border-black` a blanco translúcido), así que "seleccionado = negro" terminó siendo negro sobre negro.
- **Solución:** marca el estado con un atributo de datos (`data-size-option="selected"`) y dale una regla específica del tema que lo invierta (fondo claro y texto oscuro), declarada después de los remapeos para ganar por orden con igual especificidad.
- **Verificación:** comprueba el color de fondo calculado del estado seleccionado en cada tema.

## 10. Barras fijas y superposiciones

- Las barras fijas (CTA de compra, navegación inferior) pueden pintarse sobre un menú o panel abierto. Oculta ambas con un atributo en `<html>` (`data-mobile-menu-open="true"`): `opacity 0`, `translateY(100%)` y `pointer-events: none`.
- Limpia el atributo al cerrar, al desmontar y al navegar.
- Revisa también el zoom de la galería y los diálogos a pantalla completa.

## 11. El build publicó CSS viejo

- **Síntoma:** en el entorno desplegado, los componentes eran nuevos pero los estilos globales eran de la versión anterior (el toast quedó fuera de pantalla).
- **Causa:** Next 16.3 activa por defecto la caché de build en disco de Turbopack (`turbopackFileSystemCacheForBuild`), y en Vercel restauró un `globals.css` previo.
- **Solución:** `experimental.turbopackFileSystemCacheForBuild: false`. **Después de cada deploy, verifica que el CSS servido contenga las clases nuevas** (descarga las hojas del HTML y busca el selector). Si "no se ve" en el entorno pero sí en local, empieza por aquí.

## 12. Copy y accesibilidad textual

- **Los nombres accesibles son copy:** «Abrir menú», «Navegación principal» y «Paginación de categoría» llevan tildes. Las pruebas que buscan por nombre deben cambiar en el mismo PR.
- **Revisa espacios perdidos al concatenar** («quedóactualizado») y la concordancia de número («1 activo» frente a «2 activos»).
- **El feedback habla como el usuario:** «Producto retirado.» mejor que un término interno. Pregunta por el vocabulario de la marca antes de fijarlo.

## 13. Movimiento reducido

- Usa `MotionConfig reducedMotion="user"` en la raíz para framer-motion. Aun así, cada WAAPI propia consulta `matchMedia('(prefers-reduced-motion: reduce)')`, y el CSS usa `motion-reduce:`.
- El resultado es el mismo: el vuelo se sustituye por un toast, el panel aparece sin deslizar y los números saltan al valor final.
- Pruébalo con el contexto del navegador en `reducedMotion: 'reduce'`.

## 14. Proceso: auditar, integrar y verificar

- Audita sobre la rama vigente. Una auditoría hecha muchos commits atrás obligó a reverificar cada hallazgo, y uno ya estaba resuelto.
- **Antes de dar algo por fallido, compáralo con la base anterior:** construye y prueba el commit previo. Varias fallas E2E venían de antes y otras eran pruebas desactualizadas, no datos.
- **Las pruebas desactualizadas se corrigen con fixtures reales** (descubrir un producto real en solo lectura y ajustar y restaurar el stock cuando haga falta), no bajando la exigencia.
- **Al matar procesos por nombre, no mates tu propio comando:** hazlo por puerto.
- **Integra con revisión independiente del head final** y verifica el deploy real, sin asumirlo. Las suites largas contra entornos compartidos se corren solo con permiso.
