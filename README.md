# List and Save

Proyecto web para comparar precios de supermercado y guardar listas de compra.

## Requisitos

- Node.js 18+
- MySQL 8+

## Puesta en marcha

1. Instalar dependencias:
   `npm install`
2. Crear el archivo `.env` a partir de `.env.example`.
3. Ejecutar migraciones y seeds en MySQL con los scripts de `database/schema` y `database/seeds`.
4. Iniciar el servidor:
   `npm run dev`
5. Abrir la app en:
   `http://localhost:3000`

## Funcionalidades principales

- Registro y login de usuarios.
- Gestión de lista de compra por usuario.
- Comparador de productos por supermercado.
- Filtros y búsqueda de productos.
- Exportación de lista en formato JSON.
