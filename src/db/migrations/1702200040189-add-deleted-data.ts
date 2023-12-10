import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddDeletedData1702200040189 implements MigrationInterface {
    name = 'AddDeletedData1702200040189'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "messages"
            ADD "is_deleted" boolean NOT NULL DEFAULT false
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "messages" DROP COLUMN "is_deleted"
        `)
    }
}
