import app from './app'
import { PORT } from './config/config'
import whatsappService from './whatsapp/service'

async function bootstrap() {
    await whatsappService.init()

    app.listen(PORT, () => console.log(`server listen on port ${PORT}`))
}

bootstrap()
