import { config as loadConfig } from 'dotenv'

loadConfig()

const { APPLICATION_NAME, APPLICATION_VERSION } = process.env

const QR_TERMINAL = process.env.QR_TERMINAL?.toLowerCase() === 'true'
const PORT = +process.env.PORT || 5000
const STICKER_PASSWORD = process.env.STICKER_PASSWORD?.trim()

export { PORT, QR_TERMINAL, APPLICATION_NAME, APPLICATION_VERSION, STICKER_PASSWORD }
