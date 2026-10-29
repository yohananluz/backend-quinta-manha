import usersRepository from "../repository/users.repository.js"
import bcrypt from 'bcrypt'

const usersController = {

    async consultarTodos() {
        return await usersRepository.consultarTodo()
    },

    async consultarUm(req, reply) {
        const { id } = req.params   
        const usuario = await usersRepository.consultarUm(id)
        if (!usuario) {
            reply.code(404)
            return { mensagem: "Usuário não encontrado." }
        }
        return usuario
    },

    async cadastrarNovo(req, reply) {
        const { name, phone, mail, password } = req.body || {}

        if (!name || !phone || !mail || !password) {
            reply.code(400)
            return { mensagem: "Todos os campos (nome, telefone, e-mail e senha) são obrigatórios!" }
        }

        // Verifica se o e-mail já está em uso
        const emailExistente = await usersRepository.consultaEmail(mail)
        if (emailExistente && emailExistente.length > 0) {
            reply.code(400)
            return { mensagem: "Este e-mail já está cadastrado no sistema!" }
        }

        try {
            const saltrounds = 10
            const passcript = await bcrypt.hash(String(password), saltrounds)
            const novoUsuario = await usersRepository.cadastrarNovo(name, phone, mail, passcript)

            return {
                mensagem: `O Usuário ${name} foi cadastrado com sucesso!`,
                usuario: novoUsuario
            }
        } catch (error) {
            if (error.code === '23505') {
                reply.code(400)
                if (error.constraint === 'users_phone_key') {
                    return { mensagem: "Este telefone já está cadastrado no sistema!" }
                }
                return { mensagem: "Este e-mail já está cadastrado no sistema!" }
            }
            reply.code(500)
            return { mensagem: "Erro ao registrar usuário no banco de dados: " + error.message }
        }
    },

    async alterarRegistro(req, reply) {
        const { id } = req.params
        const { name, phone, mail, password } = req.body || {}

        if (!name || !phone || !mail || !password) {
            reply.code(400)
            return { mensagem: "Todos os campos são obrigatórios para alteração." }
        }

        let usuario = await usersRepository.consultarUm(id)
        if (!usuario) {
            reply.code(404)
            return { mensagem: "Usuário não encontrado para alteração." }
        }

        const saltrounds = 10
        const passcript = await bcrypt.hash(String(password), saltrounds)

        try {
            const msg = await usersRepository.alterarRegistro(id, name, phone, mail, passcript, usuario.name)
            return { mensagem: msg }
        } catch (error) {
            if (error.code === '23505') {
                reply.code(400)
                return { mensagem: "E-mail ou telefone já pertence a outro usuário." }
            }
            reply.code(500)
            return { mensagem: "Erro ao atualizar registro: " + error.message }
        }
    },

    async deletarRegistro(req, reply) {
        const { id } = req.params
        return await usersRepository.deletarRegistro(id)
    }

}

export default usersController
