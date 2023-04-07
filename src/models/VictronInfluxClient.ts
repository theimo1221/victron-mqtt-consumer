import { InfluxDbConnectionOptions } from './InfluxDbConnectionOptions';
import { InfluxDB } from 'influx';
import { VictronInfluxDataPoint } from './VictronInfluxDataPoint';

const ignoredMeasurements: string[] = ['solarcharger/History/Daily'];

/**
 * This class is highly inspired by https://github.com/victronenergy/venus-docker-grafana-images
 * Thanks guys, keep up the good work!
 */
export class VictronInfluxClient {
  private client: InfluxDB;
  private accumulatedPoints: VictronInfluxDataPoint[] = [];
  private readonly batchWriteInterval: number;
  private lastWriteTime: number = 0;

  public constructor(private readonly opts: InfluxDbConnectionOptions) {
    this.client = new InfluxDB({
      host: opts.host,
      port: opts.port,
      protocol: 'http',
      database: opts.database,
      username: opts.username,
      password: opts.password,
    });
    this.batchWriteInterval = (opts.batchIntervalSeconds ?? 10) * 1000;

    this.client.getDatabaseNames().then((names: string[]): void => {
      if (!names.includes(opts.database)) {
        console.log(`Creating database ${opts.database}`);
        this.client.createDatabase(opts.database).then(this.setRetention.bind(this));
      } else {
        this.setRetention();
      }
    });
  }

  private setRetention(): void {
    const retentionOpts: { duration: string; replication: number; isDefault: boolean } = {
      duration: this.opts.retentionPolicy ?? '30d',
      replication: 1,
      isDefault: true,
    };
    this.client.createRetentionPolicy('victronMqtt', retentionOpts).catch((_error: any): void => {
      this.client.alterRetentionPolicy('victronMqtt', retentionOpts);
    });
  }

  public write(topic: string, data: string): void {
    // console.log(`Writing to InfluxDB: ${topic} ${data}`);
    const topicParts: string[] = topic.split('/');
    const portalId: string = topicParts[1];
    const instanceNumber: string = topicParts[3];
    topicParts.splice(0, 2);
    topicParts.splice(1, 1);
    const measurement: string = topicParts.join('/');
    if (ignoredMeasurements.find((path) => measurement.startsWith(path))) {
      return;
    }

    const point = this.extractPoint(portalId, instanceNumber, measurement, data);
    if (point == null) {
      // console.log(`Writing to InfluxDB --> No extractable point found!`);
      return;
    }
    this.accumulatedPoints.push(point);
    const now = Date.now();
    if (this.lastWriteTime > 0 && this.batchWriteInterval > 0 && now - this.lastWriteTime < this.batchWriteInterval) {
      return;
    }
    // console.log(`Going to write ${this.accumulatedPoints.length} points to InfluxDB`);
    this.lastWriteTime = now;
    this.client.writePoints(this.accumulatedPoints).catch((err) => {
      console.error(`Error writing to InfluxDB! ${err.stack}`);
    });
    this.accumulatedPoints = [];
  }

  private extractPoint(
    portalId: string,
    instanceNumber: string,
    measurement: string,
    data: string,
  ): null | VictronInfluxDataPoint {
    let json: { value: unknown } | null = null;
    try {
      json = JSON.parse(data);
    } catch (e) {
      return null;
    }
    if (json == null || json.value === undefined || json.value === null) {
      return null;
    }
    let valueKey: string = 'value';
    if (typeof json.value === 'string') {
      if (json.value.length === 0) {
        return null;
      }
      valueKey = 'stringValue';
    } else if (typeof json.value !== 'number') {
      return null;
    }
    return {
      timestamp: new Date(),
      measurement: measurement,
      tags: {
        portalId: portalId,
        instanceNumber: instanceNumber,
        name: portalId,
      },
      fields: {
        [valueKey]: json.value,
      },
    };
  }
}
