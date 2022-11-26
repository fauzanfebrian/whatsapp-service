import * as express from 'express'
import * as QRCode from 'qrcode'
import { SendMessageDto } from './service/dto/send-message.dto'
import { WhatsappService } from './service/whatsapp'

const whatsapp = new WhatsappService()

const app = express()

app.use(express.json())

app.get('/status', (_req, res) => {
    const status = whatsapp.getStatus()

    res.json(status)
})

app.post('/message', async (req, res) => {
    try {
        const body = req.body as SendMessageDto

        if (
            !body.message ||
            !body.phone_number ||
            typeof body.message !== 'string' ||
            typeof body.phone_number !== 'string'
        ) {
            return res.status(400).json({ status: 'error', message: 'bad request error' })
        }

        const data = await whatsapp.sendMessage(body)

        return res.json({ status: 'success', data })
    } catch (error) {
        console.error(error)

        return res.status(500).json({ status: 'error', message: 'internal server error' })
    }
})

app.get('/qr-code', async (_req, res) => {
    const { qrcode, isConnected } = whatsapp.getStatus()

    if (isConnected) return res.status(400).json({ status: 'error', message: 'whatsapp has been connected' })

    if (!qrcode && !isConnected) return res.status(500).json({ status: 'error', message: 'qrcode not generate yet' })

    const buffer = await QRCode.toBuffer(qrcode)

    res.setHeader('Content-Type', 'image/png')

    return res.send(buffer)
})

app.delete('/logout', async (_req, res) => {
    try {
        const data = await whatsapp.logout()

        return res.json({ message: 'success', data })
    } catch (error) {
        console.error(error)

        return res.status(500).json({ status: 'error', message: 'internal server error' })
    }
})

const port = process.env.PORT || 5000

app.listen(port, () => console.log(`server listen on port ${port}`))
