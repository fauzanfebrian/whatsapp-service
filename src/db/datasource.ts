import { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USERNAME } from 'src/config/config'
import { DataSource } from 'typeorm'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies'
import { entities } from './entities'
import { migrations } from './migrations'

export default new DataSource({
    type: 'postgres',
    host: DB_HOST,
    port: DB_PORT,
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_NAME,
    entities,
    migrations,
    namingStrategy: new SnakeNamingStrategy(),
    synchronize: false,
    migrationsRun: true,
})
