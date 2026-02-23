# Categoria: Calendario editorial avanzado

## Objetivo

Organizar publicaciones con intencion editorial y mantener consistencia por dia, semana y mes.

## Ubicacion

- Panel admin -> `Calendario Editorial`.

## Funcionalidades incluidas

- Vistas:
  - mensual,
  - semanal,
  - diaria.
- Ficha editorial completa por pieza:
  - titulo,
  - tema,
  - estado,
  - pilar/angulo,
  - fecha y hora,
  - objetivo,
  - audiencia,
  - keywords,
  - CTA,
  - responsable,
  - notas.
- Filtros por:
  - busqueda,
  - tema,
  - estado.
- Metricas de disciplina editorial:
  - piezas del mes,
  - publicadas,
  - cadencia semanal,
  - proximo deadline.
- Balance tematico mensual para priorizar temas que resuenen.
- Sincronizacion de articulos ya publicados desde la tabla `articles`.

## Persistencia

- Datos guardados en `localStorage` con clave:
  - `admin_editorial_calendar_v1`.

## Recomendacion de uso

1. Planificar todo el mes en vista mensual.
2. Ajustar carga de trabajo en vista semanal.
3. Cerrar detalles y ejecucion en vista diaria.
