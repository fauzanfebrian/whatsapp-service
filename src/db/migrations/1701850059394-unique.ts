import { MigrationInterface, QueryRunner } from 'typeorm'

export class Unique1701850059394 implements MigrationInterface {
    name = 'Unique1701850059394'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "states"
            ADD CONSTRAINT "UQ_8d93053db706b4f57d703cb94be" UNIQUE ("credential_id", "key")
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "states" DROP CONSTRAINT "UQ_8d93053db706b4f57d703cb94be"
        `)
    }
}
