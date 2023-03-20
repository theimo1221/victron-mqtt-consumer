import { VictronMqttConnectionOptions } from '../src/models/VictronMqttConnectionOptions.js';
import { VictronMqttConsumer } from '../src/main.js';
import { setTimeout } from 'timers/promises';

class ConnectionTest {
  public static async start(): Promise<void> {
    console.log('Starte Connection Test');
    const opts = new VictronMqttConnectionOptions();
    opts.ip = '192.168.178.70';
    const consumer = new VictronMqttConsumer(opts);

    await setTimeout(10000);
    console.log('Consumer connected: ', consumer.connected);

    await setTimeout(5000);
    console.log('Energy forward, reverse', consumer.data.grid.energyForward, consumer.data.grid.energyReverse);

    consumer.disconnect();
  }
}

void ConnectionTest.start();

process.on('uncaughtException', (err) => {
  console.log(`Uncaught Exception: ${err.message}\n${err.stack}`);
  process.exit(1);
});
