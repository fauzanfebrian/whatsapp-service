import { MigrationInterface, QueryRunner } from 'typeorm'

export class Messages1702084032175 implements MigrationInterface {
    name = 'Messages1702084032175'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "messages" (
                "key" character varying NOT NULL,
                "value" json,
                "credential_id" integer NOT NULL,
                "sender" character varying NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_c8bdc6479dc84d0717f0c649197" PRIMARY KEY ("key")
            )
        `)
        await queryRunner.query(`
            ALTER TABLE "messages"
            ADD CONSTRAINT "FK_70a1de90cea6a7393c0b9e2b5b5" FOREIGN KEY ("credential_id") REFERENCES "credentials"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "messages" DROP CONSTRAINT "FK_70a1de90cea6a7393c0b9e2b5b5"
        `)
        await queryRunner.query(`
            DROP TABLE "messages"
        `)
    }
}
