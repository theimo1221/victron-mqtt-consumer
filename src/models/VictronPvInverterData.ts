import { PayloadPlus } from './PayloadPlus.js';

export class VictronPvInverterData {
  private _power: number | null = null;
  private _current: number | null = null;
  private _l1Power: number | null = null;
  private _l2Power: number | null = null;
  private _l3Power: number | null = null;
  private _l1Current: number | null = null;
  private _l2Current: number | null = null;
  private _l3Current: number | null = null;

  public onNewData(topic: string, payload: PayloadPlus): void {
    switch (topic) {
      case 'pvinverter/20/Ac/Power':
        this._power = payload.extractNumberValue();
        return;
      case 'pvinverter/20/Ac/Current':
        this._current = payload.extractNumberValue();
        return;
      case 'pvinverter/20/Ac/L1/Power':
        this._l1Power = payload.extractNumberValue();
        return;
      case 'pvinverter/20/Ac/L2/Power':
        this._l2Power = payload.extractNumberValue();
        return;
      case 'pvinverter/20/Ac/L3/Power':
        this._l3Power = payload.extractNumberValue();
        return;
      case 'pvinverter/20/Ac/L1/Current':
        this._l1Current = payload.extractNumberValue();
        return;
      case 'pvinverter/20/Ac/L2/Current':
        this._l2Current = payload.extractNumberValue();
        return;
      case 'pvinverter/20/Ac/L3/Current':
        this._l3Current = payload.extractNumberValue();
        return;
    }
  }

  public get power(): number | null {
    return this._power;
  }

  public get current(): number | null {
    return this._current;
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
