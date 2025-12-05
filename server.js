// 1. Configuração e Dependências
require('dotenv').config(); 

const express = require('express');
const { Pool } = require('pg'); 
const path = require('path');
const cors = require('cors'); 

const app = express();
const PORT = 3000;

// 2. Configuração da Conexão com o PostgreSQL
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432, 
});

// 3. Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); 

// 4. Inicialização do Banco de Dados: Conexão e Criação da Tabela
async function setupDatabase() {
    try {
        await pool.query('SELECT 1'); 
        console.log('Conectado ao PostgreSQL.');

        // MUDANÇA CRUCIAL: 'id SERIAL PRIMARY KEY' para auto-incremento
        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS tarefas (
                id SERIAL PRIMARY KEY, 
                descricao VARCHAR(255) NOT NULL,
                concluida BOOLEAN DEFAULT FALSE
            );
        `;
        await pool.query(createTableSQL);
        console.log('Tabela "tarefas" pronta.');

    } catch (err) {
        // MUDANÇA: Log de erro mais detalhado
        console.error('Erro CRÍTICO de conexão com o Banco de Dados. Verifique o .env e se o PostgreSQL está rodando:', err);
    }
}
setupDatabase(); 

// --- 5. ROTAS DA API (CRUD) ---

// CREATE (POST): Adicionar nova tarefa
app.post('/api/tarefas', async (req, res) => {
    const { descricao } = req.body;
    const sql = 'INSERT INTO tarefas (descricao) VALUES ($1) RETURNING *';
    try {
        const result = await pool.query(sql, [descricao]);
        res.status(201).json(result.rows[0]); 
    } catch (err) {
        // MUDANÇA: Log de erro detalhado na falha do INSERT
        console.error('Erro de SQL (POST) ao inserir:', err.message); 
        res.status(500).json({ error: 'Erro ao criar a tarefa.', details: err.message });
    }
});

// READ (GET): Buscar todas as tarefas
app.get('/api/tarefas', async (req, res) => {
    const sql = 'SELECT * FROM tarefas ORDER BY id DESC';
    try {
        const results = await pool.query(sql);
        res.json(results.rows);
    } catch (err) {
        console.error('Erro de SQL (GET) ao buscar:', err.message);
        res.status(500).json({ error: 'Erro ao buscar tarefas.', details: err.message });
    }
});

// UPDATE (PUT): Atualizar tarefa (mantido para a funcionalidade concluída do script.js)
app.put('/api/tarefas/:id', async (req, res) => {
    const { id } = req.params;
    const { descricao, concluida } = req.body;

    let sql;
    let params = [];

    if (descricao !== undefined) {
        sql = 'UPDATE tarefas SET descricao = $1 WHERE id = $2';
        params = [descricao, id];
    } else if (concluida !== undefined) {
        sql = 'UPDATE tarefas SET concluida = $1 WHERE id = $2';
        params = [concluida, id];
    } else {
        return res.status(400).json({ error: "Dados inválidos para atualização." });
    }

    try {
        const result = await pool.query(sql, params);
        if (result.rowCount === 0) {
             return res.status(404).json({ error: "Tarefa não encontrada." });
        }
        res.json({ message: "Tarefa atualizada com sucesso." });
    } catch (err) {
        console.error('Erro de SQL (PUT) ao atualizar:', err.message);
        res.status(500).json({ error: 'Erro ao atualizar a tarefa.', details: err.message });
    }
});

// DELETE (DELETE): Excluir tarefa
app.delete('/api/tarefas/:id', async (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM tarefas WHERE id = $1';
    try {
        const result = await pool.query(sql, [id]);
        if (result.rowCount === 0) {
             return res.status(404).json({ error: "Tarefa não encontrada." });
        }
        res.json({ message: "Tarefa excluída com sucesso." });
    } catch (err) {
        console.error('Erro de SQL (DELETE) ao excluir:', err.message);
        res.status(500).json({ error: 'Erro ao excluir a tarefa.', details: err.message });
    }
});


// 6. Inicia o Servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});