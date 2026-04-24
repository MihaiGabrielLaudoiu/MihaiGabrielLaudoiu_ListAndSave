# Base de datos - List&Save

Estructura inicial para MySQL en entorno local (Laragon).

## Estructura

- `schema/001_create_list_and_save.sql`: crea la BD y todas las tablas.
- `seeds/001_seed_supermercados.sql`: datos base de supermercados.
- `seeds/002_seed_demo_data.sql`: usuario demo + datos falsos iniciales.
- `migrations/`: cambios incrementales futuros.

## Ejecucion recomendada

1. Ejecuta `schema/001_create_list_and_save.sql`.
2. Ejecuta `seeds/001_seed_supermercados.sql`.
3. Ejecuta `seeds/002_seed_demo_data.sql`.
4. Agrega nuevas migraciones dentro de `migrations/`.
