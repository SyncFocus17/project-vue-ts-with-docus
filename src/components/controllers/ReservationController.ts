import { DatabaseService } from '@/services/DatabaseService';
import type { Package, Location, Reservation } from '@/components/types/database.ts';

export default class ReservationController {
    private static db = DatabaseService.getInstance();

    static async getPackages(): Promise<Package[]> {
        return await this.db.getPackages();
    }

    static async getLocations(): Promise<Location[]> {
        return await this.db.getLocations();
    }

    static async createReservation(data: {
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
        return await this.db.createReservation(data);
    }
}