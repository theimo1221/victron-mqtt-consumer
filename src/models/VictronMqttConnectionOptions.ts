import { InfluxDbConnectionOptions } from './InfluxDbConnectionOptions';

export class VictronMqttConnectionOptions {
  public ip: string | null = null;
  public port = 1883;
  public influxDb: InfluxDbConnectionOptions | null = null;

  public static validate(opts: VictronMqttConnectionOptions): boolean {
    if (!opts.ip || opts.ip.length < 4) {
      console.warn('Ip adress missing');
      return false;
    }
    return true;
  }
}
