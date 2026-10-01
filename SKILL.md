---
name: microinteracciones-ux
description: Criterio de experto en diseño de interacción y microinteracciones para interfaces web y apps (especialmente ecommerce y flujos transaccionales). Úsala para auditar dónde falta feedback o movimiento con sentido, proponer microinteracciones (trigger, reglas, feedback, loops y modos de Saffer; los 12 principios del motion en UX como easing, masking, dimming, cloning, value change, dolly & zoom), implementarlas con tokens de motion accesibles (prefers-reduced-motion, aria-live, foco) y verificarlas con pruebas E2E por estados observables. Actívala siempre que el usuario hable de microinteracciones, animaciones de UI, transiciones, motion design, estados de carga o skeletons, toasts o avisos, deshacer, validación en vivo, agregar al carrito, drawers, modales, menús móviles, view transitions, o pida revisar "cómo se siente" una interfaz, aunque no use la palabra microinteracción. También para comparar el antes y el después de estos cambios o presentarlos.
---

# Microinteracciones UX: auditar, implementar y verificar

Una microinteracción es un momento de una sola tarea: un disparador inicia un ciclo breve entre la persona y el sistema que termina con una acción cumplida (Saffer). Es la visibilidad y el feedback de Norman a la escala de un gesto. El objetivo no es "animar la interfaz", sino que cada acción tenga una respuesta clara, a tiempo y coherente, y que el movimiento explique qué pasó.

La IA genera interfaces en segundos; lo que no genera es criterio. Esta skill existe para aportar ese criterio: decidir si una interacción comunica, especificarla con precisión, llevarla a código que resista producción y demostrar que funciona.

## Postura

- **El movimiento comunica o sobra.** Antes de proponer una animación, di en una frase qué le explica al usuario (causa y efecto, origen y destino, jerarquía, progreso). Si no puedes, no la agregues.
- **Excelencia invisible.** Si el usuario la nota conscientemente, probablemente es demasiado. Se debe sentir, no ver.
- **El estado nunca depende solo del movimiento.** Siempre hay también texto, color, forma o un anuncio accesible. Con movimiento reducido el resultado debe ser el mismo.
- **Primero el feedback faltante, después el pulido.** Un botón que no reacciona y hace que el comprador pague dos veces es un bug; un rebote más elegante es pulido.
- **Verificado en el sitio real, no en la intención.** Una microinteracción no está hecha hasta que se comprobó en el build desplegado, en los temas y tamaños reales.

## Modelo rápido

Para cada interacción, contesta las cuatro partes de Saffer:

1. **Trigger:** ¿qué la inicia? Manual (el usuario toca) o del sistema (llega un dato).
2. **Rules:** ¿qué pasa y en qué orden? ¿Qué no puede pasar?
3. **Feedback:** ¿cómo sabe el usuario que la regla se ejecutó? Visual, texto, háptico, sonido, anuncio de lector de pantalla.
4. **Loops & Modes:** ¿qué pasa si se repite, si cambia el contexto (sin red, sin espacio, movimiento reducido, primera vez frente a la décima)?

Y ubica el tiempo según Nielsen: **0,1 s** se siente instantáneo, **1 s** es el límite típico de una microinteracción, **10 s** es el límite de atención (pasado eso hace falta progreso claro). La mayoría de las transiciones viven entre 150 y 500 ms.

La teoría completa (Norman, IxDA, las 7 dimensiones, los 4 pilares del motion, cómo medir) está en `references/fundamentos.md`.

## Flujo de trabajo

Detecta en qué punto está la persona y entra ahí. No hace falta recorrer todas las fases si solo pide una.

### 1. Auditar

1. **Audita la base actual.** Antes de reportar, confirma que miras el código o el despliegue vigente (la rama correcta, el último deploy). Un hallazgo sobre código viejo hace perder tiempo y credibilidad; si la base avanzó, reverifica cada hallazgo.
2. **Recorre el viaje, no los componentes.** Ordena por etapas de la tarea del usuario. En ecommerce: descubrir, ficha de producto, carrito, pago, después de comprar, y lo transversal (avisos, menú, carga, movimiento reducido). Para cada paso, dispara la interacción de verdad (navegador, capturas, throttling de red) y observa qué ve el usuario en los primeros 100 ms, al segundo y si algo falla.
3. **Busca estas señales**, que son las que más cuestan:
   - acciones sin confirmación (el usuario repite el clic);
   - cambios de golpe que parecen otra cosa (la foto salta, el total salta y el descuento desaparece);
   - esperas sin indicio de qué viene (pantalla en blanco o spinner genérico);
   - errores que llegan tarde o lejos del campo;
   - confirmaciones del navegador para cosas reversibles;
   - superposiciones que tapan navegación o controles;
   - estados seleccionados que no se distinguen en algún tema;
   - movimiento que no respeta `prefers-reduced-motion`.
4. **Enfoca en quien importa.** Si la persona pide "vista de comprador", no audites el admin.
5. **Entrega el reporte** con el formato de abajo. Para inspirarte con patrones probados, lee `references/catalogo-patrones.md`.

### 2. Especificar e implementar

1. **Tokens primero.** Define o reutiliza duraciones, curvas y escalonado en un solo módulo (por ejemplo `motion.ts` más variables CSS) antes de tocar componentes. Valores de partida que funcionaron:
   - curva de entrada `cubic-bezier(0.32, 0.72, 0, 1)`, curva de salida `cubic-bezier(0.5, 0, 0.75, 0)` y rebote para confirmaciones pequeñas `cubic-bezier(0.34, 1.56, 0.64, 1)`;
   - estados 180 ms, badge 220 ms, toast 280 ms, modal 280 ms, drawer 340 ms, colapso 300 ms, cambio de valor 400 ms y confirmación visible 1,2 s;
   - escalonado de 40 ms por hermano, congelado desde el octavo.
2. **Una primitiva por patrón.** Toast, número animado, región colapsable, texto que cambia (swap), vuelo al carrito, bandera transitoria: se construyen una vez y se reutilizan. Así las reglas (accesibilidad, reduced motion, duraciones) viven en un solo lugar.
3. **Aplica los principios con su receta.** Cada principio tiene reglas técnicas que evitan los errores clásicos, como no animar `height`, no animar `box-shadow` o no simular zoom con `width` y `top`. Están en `references/12-principios.md`.
4. **Accesibilidad por diseño:**
   - `prefers-reduced-motion` desactiva desplazamientos y deja color y opacidad;
   - `aria-live` anuncia solo el resultado final;
   - los diálogos atrapan el foco y lo devuelven;
   - el contenido oculto queda `inert`;
   - los errores van en una región `role="alert"` y lo demás en `role="status"`.
5. **Loops y modos explícitos.** Decide qué pasa la primera vez frente a las siguientes (modo adaptativo), sin red, con el recurso agotado, con dos acciones seguidas y si el usuario se va a mitad.
6. **Antes de escribir código en React, Next.js o framer-motion**, lee `references/lecciones-implementacion.md`. Ahí están los fallos reales que cuestan horas: salidas que se traban, skeletons que envuelven la ruta equivocada, view transitions sin pareja, cachés de build que publican CSS viejo, temas que borran el estado seleccionado.

### 3. Verificar

1. **Prueba lo que se puede observar, no la fluidez.** La suavidad no se mide con E2E; sí se mide que la microinteracción ocurra y en qué orden: atributos (`aria-busy`, `data-state`, `aria-pressed`), estilos calculados, animaciones WAAPI (`getAnimations()`, `playState`), elementos que aparecen y se retiran del DOM, llamadas a `startViewTransition`, el texto del badge en el instante del vuelo. Las técnicas y fragmentos listos están en `references/verificacion.md`.
2. **Haz la matriz de cobertura** por microinteracción: verificada, verificada en parte, solo flujo o sin prueba. Dila con honestidad; "el flujo pasa" no significa "la microinteracción existe". Escribir estas pruebas destapa defectos reales: así apareció un morph que nunca ocurría.
3. **Comprueba el despliegue.** Tras publicar:
   - confirma que el CSS servido contiene las clases nuevas;
   - recorre los temas (claro y oscuro), los tamaños (320, 390, 768, 1024, 1440) y el movimiento reducido;
   - haz una pasada breve de solo lectura. No lances suites largas contra entornos compartidos sin permiso.
4. **Mide cuando se pueda.** Revisa la tasa de doble clic o de repetición (feedback ausente), el abandono en transiciones y si el skeleton hace que la espera se perciba más corta.

### 4. Presentar el antes y el después

Solo si lo piden. Lo que funcionó con usuarios reales:

- **Una microinteracción por diapositiva,** sin portada ni introducción y sin filtros ni controles: al grano.
- **El nombre del concepto en inglés** (Masking, Value Change, Dolly & Zoom) para reconocerlo rápido; el resto en el idioma del usuario.
- **Muy poco texto:** título, concepto, una línea de antes y una de después.
- **Antes y después animados lado a lado, en bucle.** Las capturas estáticas no muestran el cambio y la gente lo nota enseguida. Recrea cada caso con HTML, CSS y JS mínimo, y comprueba que cada animación se vea completa y se repita sin romperse (cuidado con nodos eliminados en el ciclo).
- **Para movimiento reducido,** etiqueta los paneles como «Movimiento normal» y «Reducir movimiento activo», no como antes y después.

## Formato del reporte de auditoría

Usa esta estructura. Empieza con la tabla resumen para que se pueda priorizar de un vistazo; después, cada hallazgo.

```markdown
# Auditoría de microinteracciones: [producto / vista]

Base auditada: [rama o URL + commit o fecha]. Alcance: [vista de comprador, móvil y escritorio…]

## Resumen

| ID | Momento | Concepto | Prioridad |
|----|---------|----------|-----------|
| C4 | Retirar un producto | Undo + Masking | Alta |

## Hallazgos

### C4 · Retirar un producto (Undo + Masking)
- **Etapa:** Carrito · **Pantalla:** /carrito y panel lateral
- **Comportamiento actual:** la fila desaparece de golpe y el aviso tapa la barra inferior.
- **Comportamiento sugerido:** la fila se pliega en 300 ms y aparece «Producto retirado.» con Deshacer durante 6 s, sobre la barra inferior.
- **Razón:** es reversible, así que se ofrece una segunda oportunidad en vez de confirmar (patrón Gmail); el pliegue explica a dónde se fue la fila (continuidad). Heurística 1 de Nielsen.
- **Tipo de microinteracción:** Masking (grid-template-rows 1fr→0fr) + Undo · Saffer: Feedback y Loops & Modes (deshacer, eliminar varias).
- **Especificación:** 300 ms con la curva de entrada; el toast pausa su tiempo con hover o foco; con movimiento reducido, sin desplazamiento.
- **Verificación:** la línea sale del DOM, `toast-info` contiene «Producto retirado.» y Deshacer restaura la cantidad.
```

Usa IDs por etapa (D = descubrir, P = producto, C = carrito, K = pago, S = después, R = transversal) para citarlos después en código, PR y pruebas. Describe el comportamiento con las palabras de la persona usuaria, no con nombres de componentes.

## Reglas de oro, y por qué

- **Duración proporcional a la distancia y la importancia,** y salida a unas 0,7 veces la entrada. Lo que llega necesita atención; lo que se va, no.
- **Solo `transform` y `opacity`** (más `clip-path` y `grid-template-rows` para revelar). Todo lo demás provoca reflow y tirones.
- **Revela moviendo el contenido, no la caja.** Para altura variable usa `grid-template-rows` 0fr→1fr y deja inerte lo colapsado.
- **El velo entra con el panel o antes, y sale después,** nunca al revés; si no, el fondo parpadea sin cubrir.
- **La causa antes que el efecto.** Si algo vuela al carrito, el número cambia al llegar, no al salir. Ten un tope por si el vuelo no llega.
- **Deshacer en lugar de confirmar** todo lo reversible. Confirma solo lo irreversible (eliminar la cuenta).
- **Los errores se quedan hasta que se cierran** y viven en `role="alert"`; lo informativo se va solo, con tiempo visible y pausa al apuntarlo o enfocarlo.
- **No tapes la navegación** con avisos ni barras fijas; oculta las barras fijas cuando hay un menú o panel abierto.
- **Un solo anuncio por estado de carga.** Un skeleton con cuarenta "Cargando" es ruido para un lector de pantalla.
- **El skeleton imita la página que viene,** no una genérica ni la de otra ruta. Uno equivocado confunde más que ninguno.
- **Los estados seleccionados deben verse en todos los temas.** Los remapeos de tema (modo oscuro) pueden dejar negro sobre negro.
- **Modo adaptativo:** explica más la primera vez (abrir el panel) y menos después (una miniatura que vuela). Guarda la memoria por sesión.
- **No escondas la acción:** si falta un requisito (la talla), el botón guía hacia él (desplaza, enfoca, marca y dice qué falta) en vez de quedar gris y mudo.
- **Movimiento reducido no significa sin feedback:** se cambia desplazamiento por color, opacidad y texto.

## Referencias

| Archivo | Cuándo leerlo |
|---------|---------------|
| `references/fundamentos.md` | Al justificar un hallazgo con teoría, enseñar el porqué o redactar la razón de cada ítem |
| `references/12-principios.md` | Al elegir el tipo de microinteracción y al especificar o implementar cada principio |
| `references/catalogo-patrones.md` | Al auditar: 27 patrones probados en un recorrido de compra, con su antes y después |
| `references/lecciones-implementacion.md` | Antes de implementar en React, Next.js o framer-motion, y al depurar por qué algo "no se ve" |
| `references/verificacion.md` | Al escribir pruebas E2E de microinteracciones o verificar un despliegue |
