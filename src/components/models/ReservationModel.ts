import type { UserModel } from './UserModel'
import type { PackageModel } from './PackageModel'

export type ReservationStatus = 'pending' | 'cancelled' | 'confirmed' | 'definitive'

export interface ReservationModel {
    id: number
    customer: UserModel
    instructor?: UserModel
    package: PackageModel
    location: string
    date: string
    status: ReservationStatus
    cancel_reason?: string
    paid: boolean
    payment_date?: string
}