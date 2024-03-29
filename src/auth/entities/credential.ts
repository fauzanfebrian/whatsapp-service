import { AuthenticationCreds } from '@whiskeysockets/baileys'
import { prepareDataToRead, prepareDataToWrite } from 'src/util/baileys'
import {
    AfterInsert,
    AfterLoad,
    AfterUpdate,
    BeforeInsert,
    BeforeUpdate,
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm'

@Entity({ name: 'credentials' })
export class AuthCredential {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ nullable: true, type: 'json' })
    value: AuthenticationCreds

    @Column({ default: false })
    active: boolean

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt!: Date

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt!: Date

    @BeforeInsert()
    @BeforeUpdate()
    private parseJsonWrite() {
        if (this.value) {
            this.value = prepareDataToWrite(this.value)
        }
    }

    @AfterInsert()
    @AfterUpdate()
    @AfterLoad()
    private parseJsonRead() {
        if (this.value) {
            this.value = prepareDataToRead(this.value)
        }
    }
}
