import app from './app'
import whatsapp from './whatsapp'

async function bootstrap() {
    await whatsapp.init()

    const port = process.env.PORT || 5000

    app.listen(port, () => console.log(`server listen on port ${port}`))
}

bootstrap()
