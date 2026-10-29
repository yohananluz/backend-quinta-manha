import { neon } from "@neondatabase/serverless"
import dotenv from 'dotenv'
dotenv.config()
if (!process.env.DB) {
    dotenv.config({ path: 'src/.env' })
}

const query = neon(process.env.DB)

const usersRepository = {

    async initTable() {
        try {
            await query`
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    name TEXT NOT NULL,
                    phone TEXT NOT NULL UNIQUE,
                    mail TEXT NOT NULL UNIQUE,
                    password VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `
        } catch (err) {
            console.error("[DB Error] Falha ao verificar/criar tabela users:", err)
        }
    },

    async consultarTodo() {
        let usuarios = await query`
            SELECT id, name, mail, phone, created_at FROM users ORDER BY id;
        `
        return usuarios
    },

    async consultarUm(id) {
        let usuario = await query`
            SELECT id, name, mail, phone, created_at, password FROM users WHERE id = ${id}
        `
        return usuario[0]
    },

    async consultaEmail(email) {
        if (!email) return []
        let usuario = await query`
            SELECT * FROM users WHERE LOWER(TRIM(mail)) = LOWER(TRIM(${email}))
        `
        return usuario
    },

    async cadastrarNovo(name, phone, mail, password) {
        const cleanMail = mail.toLowerCase().trim()
        const cleanPhone = phone.trim()
        let novoUsuario = await query`
            INSERT INTO users (name, phone, mail, password)
            VALUES (${name.trim()}, ${cleanPhone}, ${cleanMail}, ${password})
            RETURNING id, name, phone, mail;
        `
        return novoUsuario[0]
    },

    async alterarRegistro(id, name, phone, mail, password, nomeAntigo) {
        const cleanMail = mail.toLowerCase().trim()
        const cleanPhone = phone.trim()
        let alteraUser = await query`
            UPDATE users 
            SET name = ${name.trim()}, phone = ${cleanPhone}, mail = ${cleanMail}, password = ${password}
            WHERE id = ${id}
        `
        return `O usuario ${nomeAntigo}, foi alterado para o nome ${name}, com sucesso!`
    },

    async deletarRegistro(id) {
        let deleteUser = await query`
            DELETE FROM users WHERE id = ${id}
        `
        return `Usuario com ID: ${id}, deletado com sucesso!`
    }

}

export default usersRepository
