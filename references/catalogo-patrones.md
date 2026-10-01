# Catálogo de patrones: recorrido de compra

Son 27 microinteracciones auditadas, implementadas y verificadas en un ecommerce real (Next.js + React, móvil y escritorio). Úsalas como lista de comprobación al auditar y como punto de partida al especificar. Adáptalas; no las copies a ciegas. Cada una indica:

- el problema típico (**antes**);
- el patrón (**después**);
- el concepto (en inglés, para reconocerlo rápido);
- **notas:** detalles que costaron.

Los IDs siguen la convención por etapa: D descubrir, P producto, C carrito, K pago, S después de comprar, R transversal.

## Contenido

1. Descubrir: D1 a D7
2. Ficha de producto: P1 a P4
3. Carrito: C1 a C6
4. Pago: K1 a K4
5. Después de comprar: S1 y S2
6. Transversal: R1 a R4
7. Cómo priorizar

---

## Descubrir

**D1 · Filtrar el catálogo** (Dimming + Offset & Delay)
- **Antes:** la grilla vieja sigue activa y cambia de golpe.
- **Después:** mientras carga se atenúa (45 %) y queda inerte; lo nuevo entra escalonado (fade-up de 12 px, 250 ms, 40 ms entre hermanos, tope en 8).
- **Notas:** usa el `isPending` de la navegación en transición; `aria-busy` más `inert` evita clics sobre resultados que están por irse. Anuncia el total de resultados en un `role="status"` aparte.

**D2 · Cargar una página** (Skeleton · Masking)
- **Antes:** pantalla negra con un loader; no se sabe qué viene.
- **Después:** la silueta del sitio en la primera visita y la de cada ruta (búsqueda, categoría, ficha) con su geometría real.
- **Notas:** cada destino debe mostrar **su propio** skeleton; en Next.js, un `loading.tsx` envuelve también las rutas hijas (ver lecciones). Un solo `role="status"` por skeleton.

**D3 · Cambiar de color** (Transformation)
- **Antes:** la foto salta, como si fuera otra prenda.
- **Después:** fundido cruzado; es la misma prenda en otro color.
- **Notas:** mantén ambas capas montadas durante el fundido y saca del árbol de accesibilidad la saliente. Precarga la imagen del color al pasar el cursor o enfocar la muestra.

**D4 · Abrir filtros (móvil)** (Masking + Parenting)
- **Antes:** el panel aparece de golpe.
- **Después:** se despliega en línea desde el botón que lo abrió (`grid-template-rows` 0fr→1fr), sin modal.
- **Notas:** lo colapsado queda `inert`; `overflow` visible solo al asentarse, para no recortar el foco.

**D5 · Carrusel de portada** (Value Change · Progress)
- **Antes:** cambia solo cada 2 s y tocarlo no lo detiene.
- **Después:** segmentos de progreso que se llenan, pausa con hover, foco o toque, y control visible de Pausar/Reanudar.
- **Notas:** 5 s por imagen con fundido cruzado de 400 ms. Con movimiento reducido no hay autoplay y los indicadores quedan estáticos pero navegables. Pausar el movimiento automático es un requisito WCAG.

**D6 · Cuenta regresiva** (Value Change + Loops & Modes)
- **Antes:** números que cambian siempre igual.
- **Después:** dígitos que ruedan dentro de su casilla; en la última hora la urgencia sube (rojo y separadores que laten).
- **Notas:** los relojes del servidor y del cliente no coinciden: vuelve a montar los dígitos tras hidratar, sin animar. Anuncia solo los hitos («Queda una hora»), no cada segundo.

**D7 · Del catálogo a la ficha** (Dolly & Zoom)
- **Antes:** corte seco a otra página.
- **Después:** la foto de la tarjeta crece hasta la galería de la ficha.
- **Notas:** es el patrón más frágil. Exige un nombre único en pantalla y la pareja en el mismo commit; un skeleton intermedio la rompe. Verifícalo instrumentando `startViewTransition`, porque "compila" no significa "ocurre".

## Ficha de producto

**P1 · Galería de fotos** (Masking · tiempo real)
- **Antes:** deslizas y la foto cambia de golpe al final.
- **Después:** la foto sigue al dedo, se acomoda en 300 ms y tiene resistencia en los extremos.
- **Notas:** escribe el `transform` del carril de forma imperativa (sin re-render por frame). Distingue swipe, doble toque, pellizco y arrastre.

**P2 · Guardar en favoritos** (Easing · Spring)
- **Antes:** el corazón cambia sin vida.
- **Después:** se infla (1→1,2→1 con curva de rebote), se tiñe y deja un anillo que se expande y desvanece.
- **Notas:** `aria-pressed` es la verdad del estado; la animación la acompaña. Quitar un favorito desde la lista ofrece Deshacer.

**P3 · Comprar sin elegir talla** (Feedback + Parenting)
- **Antes:** botón gris; tocarlo no hace nada.
- **Después:** el botón sigue activo y, al tocarlo, desplaza hasta las tallas, enfoca la primera disponible, marca el grupo con un pulso rojo doble y dice «Elige tu talla» (`role="alert"`).
- **Notas:** un botón deshabilitado no explica por qué; uno que guía, sí. Cada nuevo intento repite el pulso y el anuncio.

**P4 · Compartir** (Transformation)
- **Antes:** solo cambia un ícono.
- **Después:** usa la hoja nativa si existe; si no, copia el enlace y el botón muestra un check con transición y «Enlace copiado» durante un momento.
- **Notas:** usa un texto que cambia (swap) y una bandera transitoria; contempla el fallo («No se pudo copiar»).

## Carrito

**C1 · Agregar otra vez** (Cloning + Loops & Modes)
- **Antes:** cada vez, panel encima y dos avisos apilados.
- **Después:** el botón confirma «✓ Agregada» durante 1,2 s. La primera vez de la sesión se abre el panel para enseñar dónde quedó; después, la miniatura vuela en arco al carrito visible y el contador cambia al llegar.
- **Notas:** guarda el modo adaptativo en `sessionStorage`. Si no hay un ícono de carrito visible o se pide menos movimiento, confirma con un toast que incluya «Ver carrito». Resalta la línea actualizada cuando se abre el panel.

**C2 · Contador del carrito** (Value Change)
- **Antes:** el número cambia sin que se note.
- **Después:** el número rueda dentro del badge (sube o baja según la dirección) y el ícono rebota una vez.
- **Notas:** solo anima los cambios que inició el comprador, no la hidratación ni la sincronización. La etiqueta accesible incluye la cuenta («Abrir carrito, 2 productos»).

**C3 · Total del carrito** (Value Change)
- **Antes:** el total salta y el descuento desaparece mientras se recalcula.
- **Después:** el total recorre el cambio (400 ms, cifras tabulares) y el cupón sigue visible con «Recalculando» hasta tener el nuevo valor.
- **Notas:** conserva el último valor resuelto durante la sincronización y marca como pendientes solo las líneas afectadas.

**C4 · Retirar un producto** (Undo + Masking)
- **Antes:** desaparece de golpe y el aviso tapa la barra inferior.
- **Después:** la fila se pliega y aparece «Producto retirado.» con Deshacer durante 6 s, sobre la barra.
- **Notas:** si hay varias, «Retiramos N productos.». Serializa las mutaciones persistentes y protege contra un cambio de sesión a mitad.

**C5 · Aplicar un cupón** (Transformation + validación en línea)
- **Antes:** el resultado llega en un aviso lejano.
- **Después:** el campo se abre desde un «¿Tienes un cupón?», valida en línea (`aria-invalid` y mensaje junto al campo) y al aplicarse se convierte en un chip con tu ahorro y un botón para quitarlo.
- **Notas:** el error vive junto al campo, no en un toast.

**C6 · Panel del carrito** (Overlapping + Dimming)
- **Antes:** todo entra de una sola vez.
- **Después:** primero el velo, luego el panel, y dentro lo nuevo resaltado. El foco queda atrapado y vuelve al disparador; Esc cierra.
- **Notas:** desmontaje determinista por temporizador (ver lecciones); el velo dura más que el panel al salir.

## Pago

**K1 · Checkout** (Progress · Value Change)
- **Antes:** sin pasos, y un aviso que nunca cambia.
- **Después:** pasos visibles con el actual marcado (`aria-current="step"`) y una lista de requisitos que se completa (dirección, celular, aceptación).
- **Notas:** el botón de pagar explica qué falta en lugar de solo quedar deshabilitado.

**K2 · Llenar formularios** (validación en línea)
- **Antes:** escribes todo y los errores llegan al final.
- **Después:** valida al salir de cada campo, revalida al corregir, muestra un check discreto cuando el campo es válido, mide la fuerza de la contraseña y dice si coinciden.
- **Notas:**
  - al enviar, enfoca el primer campo inválido;
  - nunca borres lo escrito;
  - un error del servidor que se repite debe volver a mostrarse (reinícialo en cada envío).

**K3 · Confirmar el pedido** (Transformation · Loading state)
- **Antes:** no reacciona, y el comprador toca dos veces.
- **Después:** el botón pasa a «Confirmando pedido…» y queda bloqueado hasta la respuesta.
- **Notas:** es la microinteracción que evita órdenes duplicadas, así que tiene prioridad alta aunque "solo" sea texto.

**K4 · Pago pendiente** (Transformation + Loops & Modes)
- **Antes:** dice que se actualiza sola y se queda quieta.
- **Después:** verifica con un sondeo acotado («Intento N de 6»); el reloj se vuelve check al confirmarse y, al agotarse, un estado claro ofrece qué hacer.
- **Notas:** acota el sondeo y dale un estado final; nunca prometas "se actualizará sola" sin cumplirlo.

## Después de comprar

**S1 · Consultar un pedido** (Masking + Value Change)
- **Antes:** el resultado queda fuera de la vista.
- **Después:** el resultado se revela, desplaza hacia él, enfoca su título y marca el avance del pedido paso a paso.

**S2 · Borrar algo de la cuenta** (Undo + Masking)
- **Antes:** ventana gris de confirmación del navegador.
- **Después:** direcciones y avatar se pliegan y ofrecen Deshacer; el borrado en el servidor ocurre al vencer la ventana.
- **Notas:** solo lo irreversible (eliminar la cuenta) pide confirmación explícita.

## Transversal

**R1 · Pedir menos movimiento** (Reduced motion)
- **Antes:** la prenda vuela y el panel se desliza igual con la preferencia activa.
- **Después:** mismo resultado, pero solo cambian el color, la opacidad y el texto.
- **Notas:** `MotionConfig reducedMotion="user"`, `matchMedia` antes de cada WAAPI y la variante `motion-reduce:` en CSS.

**R2 · Avisos flotantes** (Overlapping)
- **Antes:** tapan la navegación y los errores se van solos.
- **Después:** van sobre la barra inferior, con una barra de tiempo restante que pausa con hover o foco; los errores persisten en `role="alert"`; hay acciones (Deshacer, Ver carrito).
- **Notas:** usa un id por aviso para reemplazar en lugar de apilar, y `toast.dismiss(id)`.

**R3 · Menú del celular** (Transformation + Dimming)
- **Antes:** el ícono salta de ☰ a ✕.
- **Después:** las líneas giran hasta formar la X, la página se atenúa, los enlaces entran escalonados y el foco queda atrapado.
- **Notas:** mientras está abierto, oculta las barras fijas (navegación inferior, CTA de compra) que podrían pintarse encima.

**R4 · Barra inferior** (Parenting)
- **Antes:** la marca de la pestaña activa salta.
- **Después:** la marca se desliza a la pestaña nueva (indicador compartido), y la barra se oculta con el menú abierto o durante el zoom de la galería.

---

## Cómo priorizar

1. **Alta:** feedback ausente que causa errores o dinero perdido (K3 doble envío, P3 botón mudo, C4 borrado sin deshacer), superposiciones que bloquean la navegación, estados invisibles en algún tema y movimiento reducido ignorado.
2. **Media:** continuidad y comprensión (D2, D3, C1, C2, C3, K1, K2, K4, R2, R3).
3. **Baja:** deleite (P2, D5, D6, R4), salvo que sea firma de la marca.

Dentro de cada nivel, ordena por frecuencia de uso: el carrito y la ficha pesan más que la cuenta.
