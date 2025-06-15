export interface Database {
    execute(query: string, params?: any[]): Promise<[any[], any]>
    query(query: string, params?: any[]): Promise<[any[], any]>
    connect(): Promise<void>
    end(): Promise<void>
}

export const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'kitesurfschool',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: '+00:00'
};