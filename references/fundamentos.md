# Fundamentos del diseño de interacción

Base teórica para justificar decisiones. Cita el marco que corresponda en la «Razón» de cada hallazgo: una recomendación con fundamento se defiende sola frente a quien pregunta "¿y eso para qué?".

## Contenido

1. Qué es (y qué no es) el diseño de interacción
2. Norman: visibilidad, feedback y los 3 niveles emocionales
3. Las 7 dimensiones del diseño de interacción
4. Tipos de sistemas interactivos
5. Microinteracciones según Saffer
6. Por qué importan: 3 fundamentos de investigación
7. Los 4 pilares del motion en la usabilidad
8. Tiempo real y tiempo no real
9. Criterios prácticos actuales
10. Sistemas de IA: diseñar para la incertidumbre
11. Cómo medir si el movimiento sirvió

## 1. Qué es (y qué no es)

La IxDA lo define como la disciplina que:

- define la estructura y el comportamiento de los sistemas interactivos;
- crea relaciones significativas entre las personas y los productos o servicios;
- asegura que los usuarios logren sus tareas de la forma más sencilla y gratificante posible;
- define cómo responde un artefacto o sistema a sus usuarios.

"La interacción es la esencia de toda experiencia de usuario: es la conversación entre el usuario y el producto." Si la conversación aburre, el usuario se va a hablar con alguien más interesante.

**Qué no es:** un producto puede ser bonito y funcional por separado y aun así tener una mala interacción. Cada pieza aislada se ve bien, pero el conjunto no conversa.

**Teoría de la diversión:** la novedad (despierta curiosidad) sumada a la diversión (rompe la rutina) produce compromiso. Por eso una racha o un gesto memorable enganchan.

## 2. Norman

### Visibilidad y feedback

Todo sistema interactivo tiene una entrada (la acción del usuario), una caja negra (el sistema decide) y una salida (la respuesta). La interfaz debe dar la información justa para que el usuario construya un **modelo mental correcto** de cómo funciona. El ser humano se lanza con la mínima pista y rellena el resto con explicaciones propias; si la pista es mala, el modelo mental también lo será.

### Los 3 niveles del diseño emocional (2004)

| Nivel | Qué es | Ejemplo |
|-------|--------|---------|
| Visceral | Primera impresión, instintiva: ¿se ve bien, se siente bien? | La fluidez con la que abre una app |
| Conductual | El placer y la eficacia del uso: ¿funciona sin fricción? | Un formulario que valida al momento y nunca borra lo escrito |
| Reflexivo | El significado que queda: ¿qué recuerdo y qué dice de mí? | Presumir un producto mucho después de usarlo |

El motion actúa sobre todo en lo visceral (cómo se siente) y en lo conductual (si comunica el resultado). Una historia de pequeñas interacciones bien resueltas construye lo reflexivo: la **confianza**.

## 3. Las 7 dimensiones

| Dimensión | Qué cubre |
|-----------|-----------|
| 1D Palabras | Sugieren acciones, indican dirección, influyen |
| 2D Representaciones visuales | Tipografía, íconos e imágenes, con fundamento y no como decoración |
| 3D Espacio | Dónde y con qué interactúa el usuario (mouse, teclado, toque) |
| 4D Tiempo | La dedicación que invierte en cumplir la tarea |
| 5D Comportamiento | Emociones y reacciones frente a la entrada y la salida |
| 6D Visibilidad | Que lo interactivo se perciba como tal, con patrones conocidos |
| 7D Feedback | La respuesta a cada acción y las transiciones que le dan fluidez |

Las microinteracciones trabajan sobre todo en 4D, 6D y 7D, pero 1D (el texto del feedback) es la mitad del mensaje. «Enlace copiado» comunica más que un check.

## 4. Tipos de sistemas interactivos

- **Pasivos:** no codifican acciones (una mesa).
- **Reactivos:** responden siempre igual (un bombillo, una puerta).
- **Interactivos:** procesan antes de responder, según el contexto (una calculadora).

Las interfaces modernas son interactivas: la misma acción puede tener respuestas distintas según el estado. Esos estados son los que hay que diseñar.

## 5. Microinteracciones (Saffer, 2013)

Momentos de una sola tarea, contenidos en sí mismos: un disparador inicia un ciclo breve que termina con una acción cumplida. No nacieron con el software; vienen de objetos mecánicos:

- **Antes (mecánico):** la direccional del carro. Tiene un trigger manual (la palanca), una regla física (parpadea cada ~0,5 s), un feedback audible (el clic) y un modo que se apaga al enderezar el volante.
- **Ahora (digital):** el interruptor de una app, con la misma lógica. Pero la regla, el feedback y el modo ahora son código, así que el ingeniero decide cómo se sienten.

### Las 4 partes (ejemplo: el "me gusta" con corazón)

1. **Trigger:** manual (tocar el corazón) o del sistema (llega una notificación).
2. **Rules:** al tocar, pasa de contorno a relleno y el contador suma 1.
3. **Feedback:** se infla, se vuelve rojo y vibra brevemente.
4. **Loops & Modes:** tocar de nuevo lo quita; en modo avión la acción queda en cola.

### Cuatro casos, cuatro lecciones

- **Interruptor on/off:** hereda la affordance física; es un *signifier* que se reconoce sin instrucciones.
- **Deshacer envío (Gmail):** en vez de prevenir el error, da unos segundos para revertirlo. A veces la mejor microinteracción no evita el error: da una segunda oportunidad.
- **Racha de Duolingo:** el loop llevado a hábito diario; el modo cambia cuando la racha está en riesgo y sube la urgencia visual.
- **Doble tap "me gusta":** un gesto casi oculto cuyo feedback se volvió firma de marca.

## 6. Por qué importan: 3 fundamentos

1. **Heurística 1 de Nielsen (1994), visibilidad del estado del sistema:** el sistema siempre debe mantener informado al usuario, con feedback apropiado y a tiempo.
2. **Los 3 límites de tiempo de respuesta:**
   - **0,1 s:** se percibe instantáneo; el usuario siente que controla el sistema directamente.
   - **1 s:** nota el retraso pero no pierde el hilo. Es el límite típico de una microinteracción.
   - **10 s:** límite de atención sostenida; pasado esto, el usuario abandona sin una barra de progreso clara.
3. **Norman:** una microinteracción bien hecha opera entre lo visceral y lo conductual, y repetida con consistencia construye lo reflexivo, la confianza en el producto.

## 7. Los 4 pilares del motion en la usabilidad

| Pilar | Qué logra |
|-------|-----------|
| Expectativa | Minimiza la diferencia entre lo que el usuario espera y lo que experimenta |
| Continuidad | Da un flujo coherente dentro de una escena y entre escenas |
| Narrativa | Establece una progresión de eventos con un marco temporal y espacial claro |
| Relación | Aclara las relaciones espaciales, temporales y jerárquicas entre objetos |

El movimiento no cobra vida porque alguien lo dibujó en Figma ni porque alguien lo codificó. Cobra vida cuando alguien entiende ambos lenguajes y traduce la intención en resultado.

## 8. Tiempo real y tiempo no real

- **Tiempo real:** el usuario manipula el objeto directamente (arrastrar, deslizar la galería, pellizcar). El objeto debe seguir al dedo sin retraso; la animación ocurre durante la acción.
- **Tiempo no real:** el comportamiento es posterior a la acción y transicional (el panel que entra después del clic). Aquí manda la coreografía: curva, duración y orden.

Confundirlos produce los fallos clásicos: una galería que solo cambia al soltar el dedo (debió ser tiempo real) o un panel que "sigue" el puntero (debió ser una transición).

## 9. Criterios prácticos actuales

- **Timing:** entre 200 y 500 ms. Más rápido se siente brusco; más lento, el usuario ya siguió adelante.
- **Excelencia invisible:** si se nota conscientemente, probablemente es demasiado.
- **Accesible por diseño:** respeta `prefers-reduced-motion`, y el estado nunca depende solo del movimiento; siempre hay también texto o color.
- **Adaptativa:** los usuarios expertos reciben transiciones más cortas y los nuevos, más explicativas. Un ejemplo es abrir el carrito la primera vez y después solo mostrar el vuelo.

## 10. Sistemas de IA: diseñar para la incertidumbre

Todo lo anterior asume sistemas deterministas: mismo input, mismo output. Un sistema de IA generativa es probabilístico: el mismo prompt da resultados distintos. El modelo mental del usuario debe incluir esa incertidumbre. Por eso el feedback tiene que:

- mostrar progreso real (qué está haciendo, no solo "pensando");
- permitir interrumpir o regenerar;
- dejar claro qué es propuesta y qué quedó aplicado.

## 11. Cómo medir si el movimiento sirvió

Una animación bien hecha no es la que más impresiona, sino la que se puede validar con evidencia:

- **Percepción de velocidad:** un skeleton puede hacer que una carga de 2 s se sienta más rápida que un spinner de 1 s, porque se percibe progreso.
- **Tasa de error por falta de feedback:** si los usuarios repiten un clic porque no vieron confirmación, el problema no es de UI; es movimiento o feedback ausente.
- **Abandono en transiciones:** las transiciones lentas o mareantes (parallax excesivo, movimiento no solicitado) elevan el abandono. Mídelo, no lo asumas.
