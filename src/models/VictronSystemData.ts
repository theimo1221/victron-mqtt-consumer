import { PayloadPlus } from './PayloadPlus.js';

export class VictronSystemData {
  private _l1Power: number | null = null;
  private _l2Power: number | null = null;
  private _l3Power: number | null = null;
  private _l1Current: number | null = null;
  private _l2Current: number | null = null;
  private _l3Current: number | null = null;

  public onNewData(topic: string, payload: PayloadPlus): void {
    switch (topic) {
      case 'system/0/Ac/Consumption/L1/Power':
        this._l1Power = payload.extractNumberValue();
        return;
      case 'system/0/Ac/Consumption/L2/Power':
        this._l2Power = payload.extractNumberValue();
        return;
      case 'system/0/Ac/Consumption/L3/Power':
        this._l3Power = payload.extractNumberValue();
        return;
      case 'system/0/Ac/Consumption/L1/Current':
        this._l1Current = payload.extractNumberValue();
        return;
      case 'system/0/Ac/Consumption/L2/Current':
        this._l2Current = payload.extractNumberValue();
        return;
      case 'system/0/Ac/Consumption/L3/Currentt':
        this._l3Current = payload.extractNumberValue();
        return;
    }
  }

  public get power(): number | null {
    if (this._l1Power === null || this._l2Power === null || this._l3Power === null) return null;
    return this._l1Power + this._l2Power + this._l3Power;
  }

  public get l1Power(): number | null {
    return this._l1Power;
  }

  public get l2Power(): number | null {
    return this._l2Power;
  }

  public get l3Power(): number | null {
    return this._l3Power;
  }

  public get l1Current(): number | null {
    return this._l1Current;
  }

  public get l2Current(): number | null {
    return this._l2Current;
  }

  public get l3Current(): number | null {
    return this._l3Current;
  }
}
