import { connect, IPublishPacket, MqttClient } from 'mqtt';
import { VictronDeviceData, VictronMqttConnectionOptions } from './models';
import { RegexConsts } from './RegexConsts';

export class VictronMqttConsumer {
  private client: MqttClient;
  private keepAliveInterval: NodeJS.Timer | null = null;
  private initialized = false;

  private serialNumber = '';
  private readonly _data = new VictronDeviceData();

  constructor(opts: VictronMqttConnectionOptions) {
    // Validate Options
    if (!VictronMqttConnectionOptions.validate(opts)) {
      throw new Error('Connection failed, due to invalid Options.');
    }
    // Connect to Device
    this.client = connect({
      host: opts.ip ?? undefined,
      port: opts.port,
      protocol: 'mqtt',
    });

    this.client.on('connect', () => {
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
    return this.client.connected;
  }

  public disconnect(): void {
    if (this.keepAliveInterval !== null) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
    this.client.end();
  }

  /**
   * Sets the ESS-Grid Set Point
   * @param {number} value Positive Value = from Grid, Negative Value = feeding into Grid.
   */
  public setGridSetPoint(value: number): void {
    this.client.publish(
      `W/${this.serialNumber}/settings/0/Settings/CGwacs/AcPowerSetPoint`,
      `{"value": ${value}}`,
      {
        qos: 0,
      },
      (error) => {
        if (error) {
          console.warn('PublishAdd resulted in error:', error);
        }
      },
    );
  }

  private onMessage(topic: string, _: Buffer, packet: IPublishPacket): void {
    if (RegexConsts.SERIAL_NUMBER.test(topic)) {
      this.processSerialNumber(topic);
      return;
    }
    const filteredTopic = topic.replace(`N/${this.serialNumber}/`, '');
    this.data.onNewData(filteredTopic, packet.payload.toString());
  }

  private sendKeepAlive(): void {
    if (!this.serialNumber) {
      return;
    }
    this.client.publish(
      `R/${this.serialNumber}/keepalive`,
      '',
      {
        qos: 0,
      },
      (error) => {
        if (error) {
          console.warn('Keepalive resulted in error:', error);
        }
      },
    );
  }

  private initialize(): void {
    this.initialized = true;
    console.log('Client connected starting subscription now');
    // Start subscription
    this.client.subscribe('#', (err) => {
      if (err) {
        console.log('Subscription resulted in error:', err);
      }
    });

    // Start Keepalive
    this.keepAliveInterval = setInterval(this.sendKeepAlive.bind(this), 9000);
  }

  private processSerialNumber(topic: string): void {
    const groups = RegexConsts.SERIAL_NUMBER.exec(topic);
    const secondGroupd = groups?.[1];
    if (secondGroupd) {
      this.serialNumber = secondGroupd;
    }
  }
}
