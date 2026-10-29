import usersRepository from "../repository/users.repository.js";
import bcrypt from 'bcrypt'

const authController = {

    async consultarUsuario(email) {
        if (!email) return null
        let usuario = await usersRepository.consultaEmail(email)

        if (usuario && usuario.length > 0) {
            return usuario[0]
        } 
        return null
    },

    async validacaoLogin(req, reply) {
        const { email, senha } = req.body || {}

        if (!email || !senha) {
            reply.code(400)
            return {
                sucesso: false,
                mensagem: "E-mail e senha são obrigatórios para autenticação!"
            }
        }

        const usuario = await this.consultarUsuario(email)

        if (!usuario) {
            reply.code(401)
            return {
                sucesso: false,
                mensagem: "Usuário ou senha incorreta!"
            }
        }

        let senhaValida = false
        if (usuario.password && usuario.password.startsWith('$2b$')) {
            senhaValida = await bcrypt.compare(String(senha), usuario.password)
        } else {
            senhaValida = String(senha) === usuario.password
        }

        if (!senhaValida) {
            reply.code(401)
            return {
                sucesso: false,
                mensagem: "Usuário ou senha incorreta!"
            }
        }

        return {
            sucesso: true,
            mensagem: "Logado com Sucesso!",
            nome: usuario.name,
            telefone: usuario.phone,
            id: usuario.id,
            email: usuario.mail
        }
    }

}

export default authController
