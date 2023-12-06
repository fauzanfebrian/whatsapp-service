import { AuthenticationCreds } from '@whiskeysockets/baileys'
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

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
}
