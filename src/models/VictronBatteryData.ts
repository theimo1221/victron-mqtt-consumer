import { PayloadPlus } from './PayloadPlus.js';

export class VictronBatteryData {
  private _dcCurrent: number | null = null;
  private _dcVoltage: number | null = null;
  private _dcPower: number | null = null;
  private _soc: number | null = null;
  private _soh: number | null = null;
  private _dcTemperature: number | null = null;

  public onNewData(topic: string, payload: PayloadPlus): void {
    switch (topic) {
      case 'battery/512/Dc/0/Voltage':
        this._dcVoltage = payload.extractNumberValue();
        return;
      case 'battery/512/Dc/0/Current':
        this._dcCurrent = payload.extractNumberValue();
        return;
      case 'battery/512/Dc/0/Power':
        this._dcPower = payload.extractNumberValue();
        return;
      case 'battery/512/Dc/0/Temperature':
        this._dcTemperature = payload.extractNumberValue();
        return;
      case 'battery/512/Soc':
        this._soc = payload.extractNumberValue();
        return;
      case 'battery/512/Soh':
        this._soh = payload.extractNumberValue();
        return;
    }
  }

  public get dcCurrent(): number | null {
    return this._dcCurrent;
  }

  public get dcVoltage(): number | null {
    return this._dcVoltage;
  }

  public get dcPower(): number | null {
    return this._dcPower;
  }

  public get soc(): number | null {
    return this._soc;
  }

  public get soh(): number | null {
    return this._soh;
  }

  public get dcTemperature(): number | null {
    return this._dcTemperature;
  }
}
