import { ref } from 'vue'
import { Database } from '@/components/types/database'

interface User {
    id: number
    email: string
    role: 'owner' | 'instructor' | 'customer'
    first_name: string
    last_name: string
}

class AuthService {
    private currentUser = ref<User | null>(null)
    private db: Database | null = null

    setDatabase(database: Database) {
        this.db = database
    }

    isAuthenticated(): boolean {
        return !!sessionStorage.getItem('user_id')
    }

    getUserRole(): string | null {
        return sessionStorage.getItem('user_role')
    }

    hasRole(role: string): boolean {
        return this.getUserRole() === role
    }

    async login(email: string, password: string): Promise<boolean> {
        try {
            if (!this.db) throw new Error('Database not initialized')

            const [rows] = await this.db.execute(
                `SELECT 
                    id, email, password, role, first_name, last_name,
                    is_active, email_verified, blocked
                FROM users 
                WHERE email = ?
                LIMIT 1`,
                [email]
            )

            if (!rows || rows.length === 0) {
                return false
            }

            const user = rows[0]
            const bcrypt = require('bcrypt')
            const passwordMatch = await bcrypt.compare(password, user.password)

            if (!passwordMatch) {
                await this.logLoginAttempt(user.id, email, false, 'Invalid password')
                return false
            }

            if (!user.is_active || !user.email_verified || user.blocked) {
                return false
            }

            await this.logLoginAttempt(user.id, email, true)
            await this.createSession(user.id)

            this.currentUser.value = {
                id: user.id,
                email: user.email,
                role: user.role,
                first_name: user.first_name,
                last_name: user.last_name
            }

            sessionStorage.setItem('user_id', String(user.id))
            sessionStorage.setItem('user_email', user.email)
            sessionStorage.setItem('user_role', user.role)
            sessionStorage.setItem('user_name', `${user.first_name} ${user.last_name}`)

            return true
        } catch (error) {
            console.error('Login error:', error)
            return false
        }
    }

    async logout(): Promise<void> {
        try {
            const userId = sessionStorage.getItem('user_id')
            if (userId && this.db) {
                await this.logLoginAttempt(parseInt(userId), sessionStorage.getItem('user_email') || '', true, null, 'logout')
                await this.db.execute(
                    'UPDATE user_sessions SET expires_at = NOW() WHERE user_id = ? AND expires_at > NOW()',
                    [userId]
                )
            }
        } finally {
            sessionStorage.clear()
            this.currentUser.value = null
        }
    }

    private async createSession(userId: number): Promise<void> {
        if (!this.db) return

        const token = this.generateSessionToken()
        await this.db.execute(
            `INSERT INTO user_sessions (
                user_id, 
                session_token, 
                ip_address,
                user_agent,
                expires_at
            ) VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))`,
            [userId, token, this.getClientIP(), this.getUserAgent()]
        )
    }

    private async logLoginAttempt(
        userId: number,
        email: string,
        success: boolean,
        reason?: string | null,
        action: 'login' | 'logout' | 'failed_attempt' = 'login'
    ): Promise<void> {
        if (!this.db) return

        await this.db.execute(
            `INSERT INTO logins (
                user_id,
                email,
                action,
                timestamp,
                ip_address,
                user_agent,
                success,
                failure_reason
            ) VALUES (?, ?, ?, NOW(6), ?, ?, ?, ?)`,
            [userId, email, action, this.getClientIP(), this.getUserAgent(), success, reason]
        )
    }

    private generateSessionToken(): string {
        return crypto.randomUUID()
    }

    private getClientIP(): string {
        return '127.0.0.1'
    }

    private getUserAgent(): string {
        return navigator.userAgent
    }
}

export const authService = new AuthService()