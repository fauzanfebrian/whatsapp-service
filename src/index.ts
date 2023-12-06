import app from './app'
import { PORT, WA_AUTH_METHOD } from './config/config'
import datasource from './db/datasource'
import whatsappService from './whatsapp/service'

async function initDB() {
    try {
        await datasource.initialize()
        console.log('Database connected')
    } catch (error) {
        console.error('error when connecting database')
        throw error
    }
}

async function bootstrap() {
    if (WA_AUTH_METHOD === 'db') {
        await initDB()
    }

    try {
        await whatsappService.initialize()
    } catch (error) {
        console.error(`Error when init whatsapp`)
        throw error
    }

    app.listen(PORT, () => console.log(`Server listen on port ${PORT}`))
}

bootstrap()
