import { AuthCredential } from 'src/auth/entities/credential'
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
    JoinColumn,
    ManyToOne,
    PrimaryColumn,
    UpdateDateColumn,
} from 'typeorm'
import { WhatsappMessage } from '../interface'

@Entity({ name: 'messages' })
export class Message {
    @PrimaryColumn()
    key: string

    @Column({ nullable: true, type: 'json' })
    value: WhatsappMessage

    @ManyToOne(() => AuthCredential, credential => credential.id, { onDelete: 'CASCADE' })
    @JoinColumn()
    credential: AuthCredential

    @Column()
    credentialId: number

    @Column()
    sender: string

    @Column({ default: false })
    isDeleted: boolean

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
