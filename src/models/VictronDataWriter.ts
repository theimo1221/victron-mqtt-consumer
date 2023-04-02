import { VictronMqttTopics } from './VictronMqttTopicConstants';
import { IClientPublishOptions, MqttClient } from 'mqtt';

export class VictronDataWriter {
  public constructor(private client: MqttClient, private serialNumber: string) {}

  private readonly defaultPublishOpts: IClientPublishOptions = {
    qos: 0,
  };

  private get writeMqttBasePath(): string {
    return `W/${this.serialNumber}`;
  }

  public sendKeepAlive(): void {
    this.client.publish(
      `R/${this.serialNumber}/keepalive`,
      '',
      this.defaultPublishOpts,
      this.onPublishError('keepalive'),
    );
  }

  public setGridSetPoint(value: number): void {
    this.client.publish(
      `${this.writeMqttBasePath}/${VictronMqttTopics.AcGridSetPoint}`,
      this.numberMessage(value),
      this.defaultPublishOpts,
      this.onPublishError('setGridSetPoint'),
    );
  }

  private onPublishError(name: string): (error?: Error) => void {
    return (error) => {
      if (error) {
        console.warn(`Publish "${name}" resulted in error:`, error);
      }
    };
  }

  private numberMessage(value: number): string | Buffer {
    return `{"value": ${value}}`;
  }
}
