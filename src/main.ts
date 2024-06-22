import { connect, IPublishPacket, MqttClient } from 'mqtt';
import { VictronDataWriter, VictronDeviceData, VictronInfluxClient, VictronMqttConnectionOptions } from './models';
import { RegexConsts } from './RegexConsts';

export class VictronMqttConsumer {
  private client: MqttClient | null = null;
  private keepAliveInterval: NodeJS.Timeout | null = null;
  private initialized = false;

  private serialNumber = '';
  private readonly _data = new VictronDeviceData();
  private _dataWriter?: VictronDataWriter;
  private readonly influxClient: VictronInfluxClient | null = null;
  private readonly _opts: VictronMqttConnectionOptions;
  private _queudSubscribe: boolean = false;

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
    this.refreshAll();

    if (opts.influxDb) {
      this.influxClient = new VictronInfluxClient(opts.influxDb);
    }
  }

  private reConnectMqttClient(opts: VictronMqttConnectionOptions): void {
    if (this.client !== null) {
      // In case of the client being previously connected, we need to disconnect first
      this.log('reConnectMqttClient: Disconnecting previous client');
      this.client.end(true);
    }

    this.log('reConnectMqttClient: Establishing new connection');
    // Connect to Device
    this.client = connect({
      host: opts.ip ?? undefined,
      port: opts.port,
      protocol: 'mqtt',
    });

    this.log('reConnectMqttClient: Binding events');
    this.client.on('error', (error: Error) => {
      console.error('MQTT Client onError', error);
    });

    this.client.on('disconnect', () => {
      console.warn('MQTT Client onDisconnect');
    });
    this.client.on('connect', this.onMqttConnect.bind(this));

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
    this.log('disconnect');
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
    if (this._queudSubscribe || !this.client?.connected || !this.initialized) {
      return;
    }
    this.log('sendKeepAlive');
    this.dataWriter.sendKeepAlive();
  }

  private initialize(): void {
    this.log('initialize');
    this.initialized = true;

    // Start Keepalive
    this.keepAliveInterval = setInterval(this.sendKeepAlive.bind(this), 9000);
  }

  private log(message: string, force: boolean = false, ...args: any[]): void {
    if (this._opts.debug || force) {
      console.log(`VictronMQTT: ${message}`, ...args);
    }
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
    this.log('refreshAll');
    try {
      this.reConnectMqttClient(this._opts);
    } catch (e) {
      console.error('Failed to reconnect MQTT Client:', e);
    }
  }

  private subscribe(): void {
    this.log('Client connected stop ongoing subscription, and starting new subscription.', true);
    // Start subscription
    this.client?.unsubscribe('#', () => {
      this.log('Unsubscribed from all topics');
      this.client?.subscribe('#', (err) => {
        this.log('Subscribed to all topics');
        if (err) {
          this.log('Subscription resulted in error:', true, err);
          return;
        }
      });
    });
  }

  private onMqttConnect(): void {
    this.log('onMqttConnect');
    if (!this.client) {
      throw new Error('Client not initialized');
    }
    if (!this.initialized) {
      this.subscribe();
      this.initialize();
    } else if (this._queudSubscribe) {
      return;
    }
    // Unfortunately the MQTT Client behaves weird on disconnects, resulting in akward reconnect loops
    // so to prevent this, we give the whole system some time before resubscribing.
    this._queudSubscribe = true;
    setTimeout(() => {
      try {
        this.subscribe();
      } catch (e) {
        console.error('Failed to subscribe to topics', e);
      } finally {
        this._queudSubscribe = false;
      }
    }, 10000);
  }
}
