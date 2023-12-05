import app from './app'
import whatsappService from './whatsapp/service'

async function bootstrap() {
    await whatsappService.init()

    const port = process.env.PORT || 5000

    app.listen(port, () => console.log(`server listen on port ${port}`))
}

bootstrap()
