import { VictronMqttConnectionOptions } from "./models/VictronMqttConnectionOptions.js"
import { connect, MqttClient } from "mqtt"
import { IPublishPacket } from "mqtt-packet"
import { RegexConsts } from "./RegexConsts.js"
import { VictronDeviceData } from "./models/VictronDeviceData.js"

export class VictronMqttConsumer {
  private client: MqttClient
  private keepAliveInterval: NodeJS.Timer
  private initialized = false

  private serialNumber = ""
  private readonly _data = new VictronDeviceData()
  public get data(): VictronDeviceData {
    return this._data
  }

  public get connected(): boolean {
    return this.client.connected
  }

  constructor(opts: VictronMqttConnectionOptions) {
    // Validate Options
    if (!VictronMqttConnectionOptions.validate(opts)) {
      console.warn('Connection failed, due to invalid Options.')
      return
    }
    // Connect to Device
    this.client = connect({
      host: opts.ip,
      port: opts.port,
      protocol: "mqtt"
    })

    this.client.on("connect", () => {
      if (!this.initialized) {
        this.initialize()
      }
    })

    // Add Message Listener
    this.client.on("message", this.onMessage.bind(this))
  }

  public disconnect(): void {
    clearInterval(this.keepAliveInterval)
    this.client.end()
  }

  private onMessage(topic: string, _: Buffer, packet: IPublishPacket): void {
    if (RegexConsts.SERIAL_NUMBER.test(topic)) {
      this.processSerialNumber(topic)
      return
    }
    const filteredTopic = topic.replace(`N/${this.serialNumber}/`, "")
    this.data.onNewData(filteredTopic, packet.payload.toString())
  }

  private sendKeepAlive(): void {
    if (!this.serialNumber) {
      return
    }
    this.client.publish(
      `R/${this.serialNumber}/keepalive`,
      "",
      {
        qos: 0
      },
      (error) => {
        if (error) {
          console.warn("Keepalive resulted in error:", error)
        }
      })
  }

  private initialize(): void {
    this.initialized = true
    console.log("Client connected starting subscription now")
    // Start subscription
    this.client.subscribe("#", (err) => {
      if (err) {
        console.log("Subscription resulted in error:", err)
      }
    })

    // Start Keepalive
    this.keepAliveInterval = setInterval(this.sendKeepAlive.bind(this), 9000)
  }

  private processSerialNumber(topic: string): void {
    const groups = RegexConsts.SERIAL_NUMBER.exec(topic)
    this.serialNumber = groups[1]
  }
}
