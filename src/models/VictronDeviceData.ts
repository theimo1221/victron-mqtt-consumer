import { VictronPvInverterData } from './VictronPvInverterData.js';
import { VictronBatteryData } from './VictronBatteryData.js';
import { VictronGridData } from './VictronGridData.js';
import { PayloadPlus } from './PayloadPlus.js';

export class VictronDeviceData {
  private _battery: VictronBatteryData = new VictronBatteryData();

  public get battery(): VictronBatteryData {
    return this._battery;
  }

  private _grid: VictronGridData = new VictronGridData();

  public get grid(): VictronGridData {
    return this._grid;
  }

  private _pvInverter: VictronPvInverterData = new VictronPvInverterData();

  public get pvInverter(): VictronPvInverterData {
    return this._pvInverter;
  }

  public onNewData(topic: string, payload: string): void {
    if (topic.startsWith('grid')) {
      this._grid.onNewData(topic, new PayloadPlus(payload));
    } else if (topic.startsWith('pvinverter')) {
      this._pvInverter.onNewData(topic, new PayloadPlus(payload));
    } else if (topic.startsWith('battery')) {
      this._battery.onNewData(topic, new PayloadPlus(payload));
    }
  }
}
