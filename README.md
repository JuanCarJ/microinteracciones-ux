# microinteracciones-ux

Skill de Claude Code con criterio de experto en diseño de interacción y microinteracciones para web y apps (especialmente ecommerce y flujos transaccionales): auditar dónde falta feedback, especificar microinteracciones (modelo Trigger–Reglas–Feedback–Loops/Modos de Saffer y los 12 principios del motion en UX), implementarlas con tokens de motion accesibles y verificarlas con pruebas E2E por estados observables.

## Contenido

- `SKILL.md`: postura, modelo y flujo de trabajo de la skill.
- `references/`: fundamentos, los 12 principios, catálogo de patrones, lecciones de implementación y verificación.
- `evals/`: casos de evaluación (`evals.json`) y sus fixtures; las rutas son relativas a la raíz de la skill.

## Instalación

Clonar en el directorio de skills del host:

```bash
git clone https://github.com/JuanCarJ/microinteracciones-ux.git ~/.claude/skills/microinteracciones-ux
```

La skill no otorga autoridad de implementación, despliegue ni release; los contratos del host y de cada proyecto siguen mandando.
