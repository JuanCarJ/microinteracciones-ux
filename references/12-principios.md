# Los 12 principios del motion en UX

Cada principio lleva:

- **qué comunica:** la razón para usarlo;
- **cuándo:** la señal en la interfaz que lo pide;
- **receta:** los parámetros por defecto, rellenables entre corchetes;
- **web:** la implementación nativa;
- **errores:** lo que sale mal en la práctica;
- **verificación:** el estado observable que prueba que ocurre.

Los valores entre corchetes son puntos de partida; ajústalos a los tokens del proyecto.

## Contenido

1. Easing
2. Offset & Delay
3. Parenting
4. Transformation
5. Value Change
6. Masking
7. Cloning
8. Overlapping
9. Parallax
10. Dimming
11. Dimensionality
12. Dolly & Zoom

---

## 1. Easing (suavizado)

- **Qué comunica:** peso y carácter. Un objeto real acelera y frena; lo lineal se siente mecánico.
- **Cuándo:** en todo movimiento no lineal. Es la base de los demás principios.
- **Receta:** entrada en [duración] ms con curva de desaceleración; salida a unas 0,7 veces la duración, con curva de aceleración. El carácter (decidido, suave o con rebote) define la curva. Escala la duración según la distancia recorrida. Nunca uses la curva por defecto sin pensarla.
- **Web:** `transition-timing-function` o `cubic-bezier()` en CSS; la opción `easing` en `Element.animate()`. Curvas de partida:
  - entrada `cubic-bezier(0.32, 0.72, 0, 1)`;
  - salida `cubic-bezier(0.5, 0, 0.75, 0)`;
  - rebote para confirmaciones pequeñas `cubic-bezier(0.34, 1.56, 0.64, 1)`.
- **Errores:**
  - usar la misma curva para entrar y salir;
  - rebote en elementos grandes (marea);
  - duraciones fijas para distancias muy distintas.
- **Verificación:** el estilo calculado `transition-timing-function`, o las opciones de la animación WAAPI.

## 2. Offset & Delay (compensación y retraso)

- **Qué comunica:** relación y orden. Los hermanos que entran escalonados se leen como grupo y guían la mirada.
- **Cuándo:** listas, grillas o resultados que entran juntos; menús con varios enlaces.
- **Receta:** escalonado de [40] ms por hermano, calculado con `calc(var(--i) * X)` y no a mano. Cada ítem: [250] ms, `translateY([12-16px])` y opacidad 0→1. Congela el retraso desde el ítem 8, porque si no, el último de una grilla de 24 tarda un segundo. El orden sigue la lectura natural o parte desde el clic.
- **Web:** `animation-delay` con `--i` por `nth-child` o por índice, o la opción `delay` de `Element.animate()`.
- **Errores:**
  - escalonado sin tope en listas largas;
  - volver a escalonar en cada re-render (solo lo nuevo debe entrar);
  - escalonar contenido que el usuario ya estaba viendo.
- **Verificación:** que solo los ítems nuevos tengan la animación de entrada, y que el retraso del ítem N nunca supere 8 × el paso.

## 3. Parenting (parentesco)

- **Qué comunica:** pertenencia. Lo que se mueve junto, va junto. El badge pertenece al ícono y el panel al botón que lo abrió.
- **Cuándo:** íconos con contador, paneles que nacen de un disparador, indicadores de pestaña activa.
- **Receta:** anima solo el `transform` del padre y deja que los hijos hereden, sin keyframes propios. Aplica contraescala 1/[escala] al texto o ícono que no debe deformarse. Opcionalmente, el hijo sigue al padre con [delay] ms de arrastre.
- **Web:** la jerarquía real del DOM. Para el indicador compartido entre pestañas, `layoutId` en framer-motion o FLIP.
- **Errores:**
  - animar hijo y padre por separado (se desincronizan);
  - texto deformado por no aplicar contraescala;
  - `transform-origin` equivocado (el panel "nace" del centro y no del botón).
- **Verificación:** que el indicador activo exista una sola vez y dentro del enlace actual (`aria-current="page"`).

## 4. Transformation (transformación)

- **Qué comunica:** continuidad de identidad. Es el mismo objeto cambiando de estado, no uno nuevo. El botón «Agregar» se vuelve «✓ Agregada»; el campo de cupón se vuelve tu ahorro.
- **Cuándo:** cambios de estado de un mismo control, cambios de color de una prenda y confirmaciones en el lugar.
- **Receta:** transforma de [estado A] a [B] a [C] sin desmontar ni ocultar el elemento. Usa FLIP o View Transitions con un `view-transition-name` compartido. Cada fase dura [duración] ms con la curva estándar y un solape de 60 ms entre fases. El contenido interno hace un fundido cruzado a la mitad del contenedor. Define también el camino de vuelta desde cualquier fase (error o cancelación).
- **Web:**
  - `document.startViewTransition(() => updateDOM())`;
  - FLIP con `getBoundingClientRect` y `Element.animate`;
  - para cambios de imagen, dos capas superpuestas con fundido cruzado.
- **Errores:**
  - desmontar y volver a montar (se pierde la continuidad y el foco);
  - no tener camino de error;
  - una imagen que "salta", como si fuera otra prenda, en lugar de un fundido cruzado.
- **Verificación:**
  - que durante el cambio coexistan las dos capas y luego quede una;
  - que el texto final aparezca («Enlace copiado»);
  - que la bandera transitoria vuelva a su estado.

## 5. Value Change (cambio de valor)

- **Qué comunica:** dirección y magnitud del cambio. Recorrer de 89.900 a 179.800 dice "subió el doble"; saltar solo dice "cambió".
- **Cuándo:** totales, subtotales, contadores, badges, progreso, cuentas regresivas.
- **Receta:** interpola de [A] a [B] con `requestAnimationFrame` (delta real, no frames) o con `@property`. Formatea cada frame con `Intl.NumberFormat`. Dura [400-500] ms con la curva de entrada y `font-variant-numeric: tabular-nums` para que no baile. Si hay forma (barra, arco), anímala con el mismo tiempo y curva. `aria-live` anuncia solo el valor final. En badges pequeños, el número sale hacia un lado y entra por el otro dentro de una máscara (dirección según suba o baje).
- **Web:** un componente `AnimatedNumber` que termina siempre en el valor exacto; `@property --p { syntax: '<number>' }` más `transition`.
- **Errores:**
  - mostrar 0 o "—" mientras se recalcula y perder el descuento visible (conserva el último valor resuelto hasta tener el nuevo);
  - anunciar cada frame al lector de pantalla;
  - animar cambios que no inició el usuario, como la hidratación o la sincronización (ahí el cambio es silencioso).
- **Verificación:** registra con un `MutationObserver` los textos que toma el total y comprueba que hubo valores intermedios distintos del inicial y del final.

## 6. Masking (enmascaramiento)

- **Qué comunica:** de dónde sale y a dónde va el contenido. Revelar es mover el contenido dentro de un marco fijo.
- **Cuándo:** acordeones, filtros desplegables, filas que se eliminan, carruseles, dígitos que ruedan, skeletons que dejan paso al contenido.
- **Receta:** revela u oculta moviendo el contenido, no la caja. La máscara usa `overflow: clip` o `clip-path`, y el contenido `translateX/Y`. Duración [300-350] ms. **Nunca animes `height` ni `max-height`:** si la altura es variable, usa `grid-template-rows: 0fr → 1fr`. El contenido oculto queda `inert` y fuera del orden de tabulación. Opcionalmente, revela por línea con un escalonado de 40 ms.
- **Web:**
  - `display: grid; grid-template-rows: 0fr` a `1fr`, con un hijo `min-height: 0`;
  - `overflow: hidden` mientras se mueve y `visible` al asentarse, para no recortar los anillos de foco;
  - para colapsar filas eliminadas, lo mismo de 1fr a 0fr.
- **Errores:**
  - `max-height: 9999px` (tiempo falso y tirón);
  - dejar enfocable lo colapsado;
  - recortar el anillo de foco al estar abierto.
- **Verificación:** `data-state` pasa de closed a open; el alto de la región crece; `transition-property` incluye `grid-template-rows`; no se abre un diálogo.

## 7. Cloning (clonación)

- **Qué comunica:** causa y efecto a distancia. Lo que tocaste llegó allá. La prenda vuela al carrito y el contador cambia al llegar.
- **Cuándo:** agregar al carrito o a favoritos, mover algo entre listas, crear un nuevo elemento a partir de otro.
- **Receta:**
  - mide con `getBoundingClientRect()`, monta el clon `position: fixed` en el body y anímalo con `Element.animate()`;
  - trayectoria en arco (un keyframe intermedio desplazado [80] px) de [420-520] ms con la curva de rebote; escala de [1] a [0.25] al llegar;
  - opcional: squash & stretch (`scale(1.12, 0.88)` al arrancar);
  - al llegar, el destino responde con un pulso 1→1,18→1 y **recién ahí se actualiza el dato**.
- **Web:**
  - un evento de inicio (el destino retiene el número) y uno de llegada (lo suelta), con un tope por si el vuelo no llega;
  - si no hay un destino visible o se pide menos movimiento, no vuela: confirma con texto (toast con «Ver carrito»).
- **Errores:**
  - el número cambia antes de que llegue la miniatura (efecto antes que causa);
  - volar a un ícono oculto (por ejemplo, un header recortado en ciertos anchos);
  - apilar un panel y dos avisos por la misma acción.
- **Verificación:** con un `MutationObserver` sobre `body`, registra el texto del badge cuando se añade el clon. Debe ser el valor anterior; después el badge muestra el nuevo y el clon sale del DOM.

## 8. Overlapping (superposición)

- **Qué comunica:** jerarquía temporal. Esto está encima, es momentáneo y se cierra para volver.
- **Cuándo:** modales, hojas, popovers, drawers, toasts.
- **Receta:**
  - `<dialog>` nativo con `showModal()` (o `popover`), más `@starting-style` y `transition-behavior: allow-discrete`;
  - entrada de [280-350] ms con `translateY([16px])`, `scale([0.96])` y opacidad; salida a 0,7 veces la entrada;
  - `transform-origin` en la posición del disparador;
  - el contenido interno entra [70] ms después que el contenedor y, al salir, al revés;
  - foco atrapado y devuelto al disparador al cerrar.
- **Toasts:**
  - van sobre la navegación inferior en móvil, nunca encima de ella;
  - muestran el tiempo restante y lo pausan con hover o foco;
  - los errores persisten en `role="alert"` y lo informativo va en `role="status"`;
  - las acciones como «Deshacer» duran unos 6 s.
- **Errores:**
  - salidas que se traban y dejan un velo invisible que bloquea la página (ver lecciones);
  - avisos que tapan la barra de navegación;
  - errores que se van solos antes de leerse.
- **Verificación:**
  - el foco no escapa tras N tabulaciones;
  - Esc cierra y el foco vuelve;
  - tras cerrar, el diálogo sale del DOM;
  - la caja del toast termina por encima de la navegación;
  - la animación de progreso pasa a `paused` al enfocar.

## 9. Parallax

- **Qué comunica:** profundidad y capas. Lo lejano se mueve menos.
- **Cuándo:** con moderación, en portadas o secciones editoriales. Casi nunca en flujos de tarea.
- **Receta:** capas de fondo, media y frente con factores [0.2 / 0.5 / 1]. Usa `animation-timeline: scroll()` o `view()` con `animation-range`, sin listeners de scroll. La curva es siempre lineal. El texto principal no se mueve. Sobredimensiona el fondo un 20 %. Con `prefers-reduced-motion` se desactiva por completo.
- **Errores:** parallax en texto, marearse en móvil, listeners de scroll que bloquean el hilo principal. Eleva el abandono si se abusa.
- **Verificación:** con movimiento reducido no hay animación ligada al scroll.

## 10. Dimming (oscurecimiento)

- **Qué comunica:** foco. Lo atenuado espera y no se toca.
- **Cuándo:** detrás de modales, drawers y menús; sobre resultados viejos mientras cargan los nuevos.
- **Receta:**
  - velo a opacidad [0.5] (más `backdrop-filter: blur([6px])` si aplica) en [180-250] ms;
  - anima solo la opacidad, nunca el color de fondo;
  - el velo entra con el panel o un poco antes y sale un poco después, nunca al revés;
  - bloquea la interacción con `inert` y `pointer-events: none`;
  - para resultados que se están recalculando: `aria-busy="true"`, `inert` y opacidad de alrededor de 0,45 en la grilla vieja.
- **Web:** `dialog::backdrop` o un velo propio. Para listas, el `isPending` de `useTransition` controla el estado atenuado.
- **Errores:**
  - la grilla vieja sigue activa y el usuario hace clic en un resultado que está por desaparecer;
  - el velo sale antes que el panel (parpadeo);
  - animar `background-color` (costoso).
- **Verificación:** mientras la navegación está retenida, la grilla tiene `aria-busy="true"`, `inert` y opacidad 0,45; después vuelve a 1.

## 11. Dimensionality (dimensionalidad)

- **Qué comunica:** origen y destino en el eje Z. Lo que avanza gana sombra y nitidez.
- **Cuándo:** tarjetas que se levantan, elementos que pasan al frente.
- **Receta:** `perspective: [1000px]` en el ancestro, no `perspective()` por elemento. Entrada `scale([0.92])→1`, con una rotación máxima de 12° solo si el eje está justificado, en [350] ms. Los vecinos pierden opacidad y ganan un blur leve. Para la elevación, transiciona la opacidad de un pseudoelemento que ya tiene la sombra; no animes `box-shadow`. Prohibido simular acercamiento con `width`, `height`, `top` o `left`.
- **Errores:** `box-shadow` animado (repinta), `scale` en elementos con texto sin cuidar la nitidez, 3D sin motivo.
- **Verificación:** las propiedades animadas son solo `transform` y `opacity`.

## 12. Dolly & Zoom

- **Qué comunica:**
  - **Dolly:** que navegas hacia algo. La foto de la tarjeta se convierte en la galería de la ficha y es el mismo objeto.
  - **Zoom:** que miras más de cerca sin cambiar de lugar.
- **Receta dolly:**
  - `document.startViewTransition()` con `view-transition-name` en el elemento compartido;
  - personaliza `::view-transition-old/new`; la dirección refleja la navegación (avanzar entra por la derecha, volver por la izquierda);
  - duración [420-450] ms;
  - sin soporte de la API, la vista cambia sin animación.
- **Receta zoom:** `scale` de 1 a [2] con `transform-origin` en el punto del clic. Carga la imagen en mayor resolución antes de animar. En gestos, pinch o drag continuo con spring al soltar y rubber-banding fuera de rango.
- **Regla:** no mezcles dolly y zoom en la misma transición.
- **Web (React y Next.js):** `<ViewTransition name share default="none">` alrededor del medio compartido. **La pareja debe existir en el mismo commit:** si la ruta de destino muestra antes un `loading.tsx`, la foto sale sin pareja y no hay morph. Ver las lecciones de implementación para la solución (nombre pendiente en el skeleton).
- **Errores:**
  - dos elementos con el mismo `view-transition-name` en pantalla (la transición aborta);
  - un skeleton intermedio que rompe la pareja;
  - suponer que "está implementado" sin comprobar que `startViewTransition` se llama.
- **Verificación:** instrumenta `document.startViewTransition` con un `addInitScript` y comprueba que se llamó y que el nombre compartido estaba presente.

---

## Principios transversales

- **Feedback de carga (skeleton):** imita la geometría de la página que viene. Lleva un único `role="status"` con texto («Cargando producto…») y bloques decorativos `aria-hidden`. Supera a un spinner en percepción de velocidad.
- **Undo en vez de confirmar:** para lo reversible, ejecuta de inmediato, pliega (Masking) y ofrece Deshacer durante un tiempo visible. Si hay que borrar en el servidor, hazlo diferido y cancélalo al deshacer.
- **Validación en vivo:**
  - valida al salir del campo y revalida al corregir;
  - el mensaje aparece junto al campo con un fundido de unos 150 ms;
  - un check discreto marca lo válido;
  - enfoca el primer campo inválido al enviar;
  - nunca borres lo escrito.
- **Loading state de acciones:** el botón que dispara una operación de más de unos 300 ms cambia su texto («Confirmando pedido…») y queda bloqueado para impedir el doble envío.
- **Reduced motion:** mismo resultado, sin desplazamientos; quedan color, opacidad y texto. En framer-motion usa `MotionConfig reducedMotion="user"`; en WAAPI, consulta `matchMedia` antes de animar.
