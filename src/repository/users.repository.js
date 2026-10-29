import { neon } from "@neondatabase/serverless"
import dotenv from 'dotenv'
dotenv.config()
if (!process.env.DB) {
    dotenv.config({ path: 'src/.env' })
}

const query = neon(process.env.DB)


const usersRepository = {

    async consultarTodo() {
        let usuarios = await query`
            SELECT * FROM users;
        `
        return usuarios
    },

    async consultarUm(id) {
        let usuario = await query`
            SELECT * FROM users WHERE id = ${id}
        `
        return usuario[0]
    },

    async consultaEmail(email) {
        let usuario = await query`
            SELECT * FROM users WHERE mail = ${email}
        `
        return usuario
    },


    async cadastrarNovo(name, phone, mail, password) {
        let novoUsuario = await query`
            INSERT INTO users (name, phone, mail, password)
            VALUES (${name}, ${phone}, ${mail}, ${password});
        `
        return `O Usuario: ${name} foi cadastrado com sucesso!`
    },




    async alterarRegistro(id, name, phone, mail, password, nomeAntigo) {


        let alteraUser = await query`
            UPDATE users 
            SET name = ${name}, phone = ${phone}, mail = ${mail}, password = ${password}
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