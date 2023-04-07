export class PayloadPlus {
  public payload: string;

  constructor(data: string) {
    this.payload = data;
  }

  public extractNumberValue(): number {
    // This can occasionally throw an exception, in case of a bad payload.
    return JSON.parse(this.payload).value;
  }
}
