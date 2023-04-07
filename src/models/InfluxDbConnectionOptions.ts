export interface InfluxDbConnectionOptions {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  retentionPolicy?: string;
  batchIntervalSeconds?: number;
}
