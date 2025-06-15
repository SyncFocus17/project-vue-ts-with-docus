import axios from 'axios'
import type { UserModel } from '@/components/models/UserModel'

export default {
    async getProfile(): Promise<UserModel> {
        const res = await axios.get('/api/users/me')
        return res.data
    },
    async login(email: string, password: string): Promise<UserModel> {
        const res = await axios.post('/api/auth/login', { email, password })
        return res.data
    },
    async register(user: Partial<UserModel>, password: string): Promise<UserModel> {
        const res = await axios.post('/api/auth/register', { ...user, password })
        return res.data
    },
    async updateProfile(user: Partial<UserModel>): Promise<UserModel> {
        const res = await axios.put('/api/users/me', user)
        return res.data
    }
}