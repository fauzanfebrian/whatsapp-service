import { MigrationInterface, QueryRunner } from 'typeorm'

export class Auth1701839162576 implements MigrationInterface {
    name = 'Auth1701839162576'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "credentials" (
                "id" SERIAL NOT NULL,
                "value" json,
                "active" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_1e38bc43be6697cdda548ad27a6" PRIMARY KEY ("id")
            )
        `)
        await queryRunner.query(`
            CREATE TABLE "states" (
                "id" SERIAL NOT NULL,
                "key" character varying NOT NULL,
                "value" json,
                "credential_id" integer NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_09ab30ca0975c02656483265f4f" PRIMARY KEY ("id")
            )
        `)
        await queryRunner.query(`
            ALTER TABLE "states"
            ADD CONSTRAINT "FK_b0bfa05b4e97321b46de4a8324f" FOREIGN KEY ("credential_id") REFERENCES "credentials"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "states" DROP CONSTRAINT "FK_b0bfa05b4e97321b46de4a8324f"
        `)
        await queryRunner.query(`
            DROP TABLE "states"
        `)
        await queryRunner.query(`
            DROP TABLE "credentials"
        `)
    }
}
