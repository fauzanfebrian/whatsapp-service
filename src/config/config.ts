import { config as loadConfig } from 'dotenv'

loadConfig()

const { APPLICATION_NAME, APPLICATION_VERSION, DB_HOST, DB_USERNAME, DB_PASSWORD, DB_NAME } = process.env

const QR_TERMINAL = process.env.QR_TERMINAL?.toLowerCase() === 'true'
const PORT = +process.env.PORT || 5000
const STICKER_PASSWORD = process.env.STICKER_PASSWORD?.trim()
const DB_PORT = +process.env.DB_PORT

const WA_AUTH_METHOD: 'db' | 'file' = DB_HOST && DB_NAME && DB_PORT && DB_PASSWORD && DB_USERNAME ? 'db' : 'file'

export {
    PORT,
    QR_TERMINAL,
    APPLICATION_NAME,
    APPLICATION_VERSION,
    STICKER_PASSWORD,
    DB_HOST,
    DB_PORT,
    DB_USERNAME,
    DB_PASSWORD,
    DB_NAME,
    WA_AUTH_METHOD,
}
