import { PayloadPlus } from "./PayloadPlus.js";

export class VictronBatteryData {
  private _dcCurrent: number;
  private _dcVoltage: number;
  private _dcPower: number;
  private _soc: number;
  private _soh: number;
  private _dcTemperature: number;
  public onNewData(topic: string, payload: PayloadPlus): void {
    switch (topic) {
      case "battery/512/Dc/0/Voltage":
        this._dcVoltage = payload.extractNumberValue()
        return
      case "battery/512/Dc/0/Current":
        this._dcCurrent = payload.extractNumberValue()
        return
      case "battery/512/Dc/0/Power":
        this._dcPower = payload.extractNumberValue()
        return
      case "battery/512/Dc/0/Temperature":
        this._dcTemperature = payload.extractNumberValue()
        return
      case "battery/512/Soc":
        this._soc = payload.extractNumberValue()
        return
      case "battery/512/Soh":
        this._soh = payload.extractNumberValue()
        return
    }

  }

  public get dcCurrent(): number {
    return this._dcCurrent;
  }

  public get dcVoltage(): number {
    return this._dcVoltage;
  }

  public get dcPower(): number {
    return this._dcPower;
  }

  public get soc(): number {
    return this._soc;
  }

  public get soh(): number {
    return this._soh;
  }

  public get dcTemperature(): number {
    return this._dcTemperature;
  }
}
