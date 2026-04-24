# Migraciones SQL

Esta carpeta queda preparada para migraciones.

Convencion recomendada:

- `002_add_indexes.sql`
- `003_add_user_profile_fields.sql`
- `004_create_audit_logs.sql`

Consejos:

- usa prefijo numerico incremental;
- incluye `USE list_and_save;` al inicio;
- documenta en comentarios el objetivo de cada cambio.
