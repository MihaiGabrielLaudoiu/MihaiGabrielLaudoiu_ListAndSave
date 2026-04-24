require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { query } = require('./db');

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

const TABLES = {
    users: { table: 'Usuarios', pk: 'id_usuario' },
    products: { table: 'Productos', pk: 'id_producto' },
    supermarkets: { table: 'Supermercados', pk: 'id_supermercado' },
    settings: { table: 'AjustesUsuario', pk: 'id_ajuste' },
    'saved-lists': { table: 'ListasGuardadas', pk: 'id_lista' },
    'product-stores': { table: 'ProductosTienda', pk: 'id_producto_tienda' },
    prices: { table: 'Precios', pk: 'id_precio' }
};

app.get('/api/health', async (_req, res) => {
    await query('SELECT 1');
    res.json({ ok: true });
});

app.post('/api/auth/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email y password son obligatorios' });
    }

    const exists = await query('SELECT id_usuario FROM Usuarios WHERE email = ?', [email]);
    if (exists.length) {
        return res.status(409).json({ message: 'Ya existe un usuario con ese email' });
    }

    const result = await query(
        'INSERT INTO Usuarios (email, password) VALUES (?, ?)',
        [email, password]
    );

    const user = await query(
        'SELECT id_usuario, email, fecha_registro FROM Usuarios WHERE id_usuario = ?',
        [result.insertId]
    );
    res.status(201).json(user[0]);
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email y password son obligatorios' });
    }

    const users = await query(
        'SELECT id_usuario, email, password, fecha_registro FROM Usuarios WHERE email = ?',
        [email]
    );

    if (!users.length || users[0].password !== password) {
        return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    const { password: _password, ...safeUser } = users[0];
    res.json({ ...safeUser, token: `local-token-${safeUser.id_usuario}` });
});

app.get('/api/auth/demo-credentials', (_req, res) => {
    res.json({
        email: process.env.DEMO_EMAIL || 'demo@listandsave.local',
        password: process.env.DEMO_PASSWORD || 'demo1234'
    });
});

function buildCrudRoutes(resource, config) {
    app.get(`/api/${resource}`, async (_req, res) => {
        const rows = await query(`SELECT * FROM ${config.table}`);
        res.json(rows);
    });

    app.get(`/api/${resource}/:${config.pk}`, async (req, res) => {
        const rows = await query(
            `SELECT * FROM ${config.table} WHERE ${config.pk} = ?`,
            [req.params[config.pk]]
        );
        if (!rows.length) {
            return res.status(404).json({ message: 'No encontrado' });
        }
        res.json(rows[0]);
    });

    app.post(`/api/${resource}`, async (req, res) => {
        const fields = Object.keys(req.body || {});
        if (!fields.length) {
            return res.status(400).json({ message: 'Body vacio' });
        }
        const placeholders = fields.map(() => '?').join(', ');
        const sql = `INSERT INTO ${config.table} (${fields.join(', ')}) VALUES (${placeholders})`;
        const result = await query(sql, fields.map((field) => req.body[field]));
        res.status(201).json({ [config.pk]: result.insertId, ...req.body });
    });

    app.put(`/api/${resource}/:${config.pk}`, async (req, res) => {
        const fields = Object.keys(req.body || {});
        if (!fields.length) {
            return res.status(400).json({ message: 'Body vacio' });
        }
        const sql = `UPDATE ${config.table} SET ${fields.map((field) => `${field} = ?`).join(', ')} WHERE ${config.pk} = ?`;
        await query(sql, [...fields.map((field) => req.body[field]), req.params[config.pk]]);
        res.json({ [config.pk]: Number(req.params[config.pk]), ...req.body });
    });

    app.delete(`/api/${resource}/:${config.pk}`, async (req, res) => {
        await query(`DELETE FROM ${config.table} WHERE ${config.pk} = ?`, [req.params[config.pk]]);
        res.status(204).send();
    });
}

Object.entries(TABLES).forEach(([resource, config]) => buildCrudRoutes(resource, config));

app.use((error, _req, res, _next) => {
    console.error(error);
    res.status(500).json({ message: 'Error interno del servidor' });
});

app.listen(PORT, () => {
    console.log(`List&Save API en http://localhost:${PORT}`);
});
