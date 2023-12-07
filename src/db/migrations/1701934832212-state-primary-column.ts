import { MigrationInterface, QueryRunner } from 'typeorm'

export class StatePrimaryColumn1701934832212 implements MigrationInterface {
    name = 'StatePrimaryColumn1701934832212'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "states" DROP CONSTRAINT "UQ_8d93053db706b4f57d703cb94be"
        `)
        await queryRunner.query(`
            ALTER TABLE "states" DROP CONSTRAINT "PK_09ab30ca0975c02656483265f4f"
        `)
        await queryRunner.query(`
            ALTER TABLE "states" DROP COLUMN "id"
        `)
        await queryRunner.query(`
            ALTER TABLE "states"
            ADD CONSTRAINT "PK_e48c775a333c28b421c470a4857" PRIMARY KEY ("key")
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "states" DROP CONSTRAINT "PK_e48c775a333c28b421c470a4857"
        `)
        await queryRunner.query(`
            ALTER TABLE "states"
            ADD "id" SERIAL NOT NULL
        `)
        await queryRunner.query(`
            ALTER TABLE "states"
            ADD CONSTRAINT "PK_09ab30ca0975c02656483265f4f" PRIMARY KEY ("id")
        `)
        await queryRunner.query(`
            ALTER TABLE "states"
            ADD CONSTRAINT "UQ_8d93053db706b4f57d703cb94be" UNIQUE ("key", "credential_id")
        `)
    }
}
