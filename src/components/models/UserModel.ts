export type UserRole = 'customer' | 'instructor' | 'owner'

export interface UserModel {
    id: number
    email: string
    first_name: string
    last_name: string
    address?: string
    city?: string
    birthdate?: string
    bsn?: string
    phone?: string
    role: UserRole
    is_active: boolean
    email_verified: boolean
    blocked: boolean
}