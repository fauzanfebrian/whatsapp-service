import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm'
import { AuthCredential } from './credential'

@Entity({ name: 'states' })
export class AuthState {
    @PrimaryGeneratedColumn()
    id: string

    @Column()
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
}
