import { connect, IPublishPacket, MqttClient } from 'mqtt';
import { VictronDeviceData, VictronDataWriter, VictronMqttConnectionOptions, VictronInfluxClient } from './models';
import { RegexConsts } from './RegexConsts';

export class VictronMqttConsumer {
  private client: MqttClient | null = null;
  private keepAliveInterval: NodeJS.Timer | null = null;
  private initialized = false;

  private serialNumber = '';
  private readonly _data = new VictronDeviceData();
  private _dataWriter?: VictronDataWriter;
  private readonly influxClient: VictronInfluxClient | null = null;
  private _opts: VictronMqttConnectionOptions;

  private get dataWriter(): VictronDataWriter {
    if (!this._dataWriter) {
      throw new Error('No DataWriter available, please connect first');
    }
    return this._dataWriter;
  }

  constructor(opts: VictronMqttConnectionOptions, refreshAllIntervalSeconds = 1800) {
    setInterval(this.refreshAll.bind(this), refreshAllIntervalSeconds * 1000);
    // Validate Options
    if (!VictronMqttConnectionOptions.validate(opts)) {
      throw new Error('Connection failed, due to invalid Options.');
    }
    this._opts = opts;
    this.reConnectMqttClient(opts);

    if (opts.influxDb) {
      this.influxClient = new VictronInfluxClient(opts.influxDb);
    }
  }

  private reConnectMqttClient(opts: VictronMqttConnectionOptions): void {
    // Connect to Device
    this.client = connect({
      host: opts.ip ?? undefined,
      port: opts.port,
      protocol: 'mqtt',
    });

    this.client.on('connect', () => {
      this.subscribe();
      if (!this.initialized) {
        this.initialize();
      }
    });

    // Add Message Listener
    this.client.on('message', this.onMessage.bind(this));
  }

  public get data(): VictronDeviceData {
    return this._data;
  }

  public get connected(): boolean {
    return this.client?.connected === true;
  }

  public disconnect(): void {
    if (this.keepAliveInterval !== null) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
    this.client?.end();
  }

  /**
   * Sets the ESS-Grid Set Point
   * @param {number} value Positive Value = from Grid, Negative Value = feeding into Grid.
   */
  public setGridSetPoint(value: number): void {
    this.dataWriter.setGridSetPoint(value);
  }

  private onMessage(topic: string, _: Buffer, packet: IPublishPacket): void {
    try {
      // If a message can't be processed, it will be ignored.
      this.processMessage(topic, packet);
    } catch (e) {
      // console.log('Error while processing message', e);
    }
  }

  private sendKeepAlive(): void {
    this.dataWriter.sendKeepAlive();
  }

  private initialize(): void {
    this.initialized = true;

    // Start Keepalive
    this.keepAliveInterval = setInterval(this.sendKeepAlive.bind(this), 9000);
  }

  private processSerialNumber(topic: string): void {
    const groups = RegexConsts.SERIAL_NUMBER.exec(topic);
    const secondGroupd = groups?.[1];
    if (secondGroupd && this.client) {
      this.serialNumber = secondGroupd;
      this._dataWriter = new VictronDataWriter(this.client, this.serialNumber);
    }
  }

  private processMessage(topic: string, packet: IPublishPacket): void {
    this.influxClient?.write(topic, packet.payload.toString());
    if (RegexConsts.SERIAL_NUMBER.test(topic)) {
      this.processSerialNumber(topic);
      return;
    }
    const filteredTopic = topic.replace(`N/${this.serialNumber}/`, '');
    this.data.onNewData(filteredTopic, packet.payload.toString());
  }

  private refreshAll(): void {
    this.reConnectMqttClient(this._opts);
  }

  private subscribe(): void {
    console.log('Client connected starting subscription now');
    // Start subscription
    this.client?.subscribe('#', (err) => {
      if (err) {
        console.log('Subscription resulted in error:', err);
        return;
      }
    });
  }
}
