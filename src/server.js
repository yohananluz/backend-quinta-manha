// instanciando o fastify
import Fastify from 'fastify'
import dotenv from 'dotenv'
dotenv.config()
if (!process.env.DB) {
    dotenv.config({ path: 'src/.env' })
}
import cors from '@fastify/cors'
import fastifyStatic from '@fastify/static'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

import usersRoutes from './routes/users.routes.js'
import authRoutes from './routes/auth.routes.js'
import usersRepository from './repository/users.repository.js'

const fastify = Fastify({
    logger: true
})

// Permite requisições com corpo vazio sem rejeitar se o cabeçalho application/json estiver presente
fastify.removeContentTypeParser('application/json')
fastify.addContentTypeParser('application/json', { parseAs: 'string' }, (req, body, done) => {
    if (!body || body.trim() === '') {
        done(null, null)
        return
    }
    try {
        const json = JSON.parse(body)
        done(null, json)
    } catch (err) {
        err.statusCode = 400
        done(err, undefined)
    }
})

await fastify.register(cors, {
    methods: '*',
    origin: '*'
})

// Servir os arquivos estáticos do frontend
await fastify.register(fastifyStatic, {
    root: path.join(__dirname, '../frontend'),
    prefix: '/',
})

// Rota de verificação de status da API
fastify.get('/api/health', (req, reply) => {
    return { status: 'ok', message: 'Servidor Fastify operacional' }
})

await fastify.register(usersRoutes)
await fastify.register(authRoutes)

// Inicializa a tabela users caso seja um novo banco de dados
await usersRepository.initTable()

// Run the server!
const port = Number(process.env.PORT) || 3000
fastify.listen({ port, host: '0.0.0.0' }, function (err, address) {
    if (err) {
        fastify.log.error(err)
        process.exit(1)
    }
    // Server is now listening on ${address}
})
