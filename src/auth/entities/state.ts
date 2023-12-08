import { BufferJSON } from '@whiskeysockets/baileys'
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
import { AuthCredential } from './credential'

@Entity({ name: 'states' })
export class AuthState {
    @PrimaryColumn()
    key: string

    @Column({ nullable: true, type: 'json' })
    value: any

    @ManyToOne(() => AuthCredential, credential => credential.id, { onDelete: 'CASCADE' })
    @JoinColumn()
    credential: AuthCredential

    @Column()
    credentialId: number

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt!: Date

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt!: Date

    @BeforeInsert()
    @BeforeUpdate()
    private parseJsonWrite() {
        if (this.value) {
            this.value = JSON.parse(JSON.stringify(this.value, BufferJSON.replacer))
        }
    }

    @AfterInsert()
    @AfterUpdate()
    @AfterLoad()
    private parseJsonRead() {
        if (this.value) {
            this.value = JSON.parse(JSON.stringify(this.value), BufferJSON.reviver)
        }
    }
}
