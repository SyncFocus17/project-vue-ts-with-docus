import mysql, { Connection } from 'mysql2/promise';
import type {
    User, Package, Location, Reservation, DuoParticipant, DatabaseError
} from '../components/types/database.ts';

export class DatabaseService {
    private static instance: DatabaseService;
    private connection: Connection | null = null;

    private readonly config = {
        host: 'db-par-01.apollopanel.com:3306',
        user: 'u174631_cPt0mOQ0QA',
        password: 'ZQTCtTWPM@+W3tVwgnkjUaY=',
        database: 's174631_kitesurfschool',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        dateStrings: true
    };

    private readonly CURRENT_TIMESTAMP = '2025-06-08 12:49:35';

    private constructor() {
        this.initializeConnection();
    }

    public static getInstance(): DatabaseService {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }

    private async initializeConnection(): Promise<void> {
        try {
            this.connection = await mysql.createConnection(this.config);
            console.log('Database connected successfully');
        } catch (error) {
            const dbError = error as DatabaseError;
            console.error('Database connection failed:', dbError);
            throw new Error(dbError.sqlMessage || 'Failed to connect to database');
        }
    }

    private async ensureConnection(): Promise<void> {
        if (!this.connection) {
            await this.initializeConnection();
        }
    }

    private async executeQuery<T>(sql: string, params: any[] = []): Promise<T> {
        await this.ensureConnection();
        try {
            const [results] = await this.connection!.execute(sql, params);
            return results as T;
        } catch (error) {
            const dbError = error as DatabaseError;
            console.error('Query execution error:', dbError);
            throw new Error(dbError.sqlMessage || 'Database query failed');
        }
    }

    async getUserById(id: number): Promise<User> {
        const sql = `
            SELECT * FROM users 
            WHERE id = ? AND is_active = TRUE AND blocked = FALSE
        `;
        const users = await this.executeQuery<User[]>(sql, [id]);
        if (users.length === 0) {
            throw new Error('User not found');
        }
        return users[0];
    }

    async getPackages(): Promise<Package[]> {
        const sql = `
            SELECT id, name, description, price, 
                   duration_hours, max_persons, num_sessions
            FROM packages 
            ORDER BY price ASC
        `;
        return this.executeQuery<Package[]>(sql);
    }

    async getLocations(): Promise<Location[]> {
        const sql = `
            SELECT id, name, address
            FROM locations
            ORDER BY name ASC
        `;
        return this.executeQuery<Location[]>(sql);
    }

    async createReservation(data: {
        customer_id: number;
        package_id: number;
        location_id: number;
        date: string;
        duo_participant?: {
            name: string;
            email?: string;
            phone?: string;
        };
    }): Promise<Reservation> {
        await this.ensureConnection();
        await this.connection!.beginTransaction();

        try {
            // Create reservation
            const [reservationResult] = await this.connection!.execute(`
                INSERT INTO reservations (
                    customer_id, package_id, location_id, date, 
                    status, created_at, updated_at
                ) VALUES (?, ?, ?, ?, 'pending', ?, ?)
            `, [
                data.customer_id,
                data.package_id,
                data.location_id,
                data.date,
                this.CURRENT_TIMESTAMP,
                this.CURRENT_TIMESTAMP
            ]);

            const reservationId = (reservationResult as any).insertId;

            // Add duo participant if provided
            if (data.duo_participant) {
                await this.connection!.execute(`
                    INSERT INTO duo_participants (
                        reservation_id, name, email, phone
                    ) VALUES (?, ?, ?, ?)
                `, [
                    reservationId,
                    data.duo_participant.name,
                    data.duo_participant.email || null,
                    data.duo_participant.phone || null
                ]);
            }

            // Log the email
            await this.connection!.execute(`
                INSERT INTO email_log (
                    user_id, email_to, subject, body, sent_at
                ) VALUES (?, ?, ?, ?, ?)
            `, [
                data.customer_id,
                data.duo_participant?.email || null,
                'Reserveringsbevestiging Kitesurfschool',
                `Reservering #${reservationId} is succesvol aangemaakt.`,
                this.CURRENT_TIMESTAMP
            ]);

            await this.connection!.commit();

            // Fetch and return the created reservation
            const [reservations] = await this.connection!.execute(`
                SELECT * FROM reservations WHERE id = ?
            `, [reservationId]);

            return (reservations as Reservation[])[0];

        } catch (error) {
            await this.connection!.rollback();
            const dbError = error as DatabaseError;
            console.error('Reservation creation failed:', dbError);
            throw new Error(dbError.sqlMessage || 'Failed to create reservation');
        }
    }

    async getReservationWithDetails(id: number): Promise<Reservation & { duo_participant?: DuoParticipant }> {
        const sql = `
            SELECT r.*, 
                   dp.id as dp_id, dp.name as dp_name, 
                   dp.email as dp_email, dp.phone as dp_phone
            FROM reservations r
            LEFT JOIN duo_participants dp ON r.id = dp.reservation_id
            WHERE r.id = ?
        `;

        const results = await this.executeQuery<any[]>(sql, [id]);

        if (results.length === 0) {
            throw new Error('Reservation not found');
        }

        const row = results[0];
        const reservation: Reservation & { duo_participant?: DuoParticipant } = {
            id: row.id,
            customer_id: row.customer_id,
            instructor_id: row.instructor_id,
            package_id: row.package_id,
            location_id: row.location_id,
            date: row.date,
            status: row.status,
            cancel_reason: row.cancel_reason,
            paid: Boolean(row.paid),
            payment_date: row.payment_date,
            created_at: row.created_at,
            updated_at: row.updated_at
        };

        if (row.dp_id) {
            reservation.duo_participant = {
                id: row.dp_id,
                reservation_id: row.id,
                name: row.dp_name,
                email: row.dp_email,
                phone: row.dp_phone
            };
        }

        return reservation;
    }

    async updateReservationStatus(
        id: number,
        status: 'pending' | 'cancelled' | 'confirmed' | 'definitive',
        cancel_reason?: string
    ): Promise<void> {
        const sql = `
            UPDATE reservations
            SET status = ?,
                cancel_reason = ?,
                updated_at = ?
            WHERE id = ?
        `;

        await this.executeQuery(sql, [
            status,
            cancel_reason || null,
            this.CURRENT_TIMESTAMP,
            id
        ]);
    }

    async close(): Promise<void> {
        if (this.connection) {
            await this.connection.end();
            this.connection = null;
        }
    }
}