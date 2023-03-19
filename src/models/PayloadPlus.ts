export class PayloadPlus {
  public payload: string

  constructor(data: string) {
    this.payload = data
  }

  public extractNumberValue(): number {
    return JSON.parse(this.payload).value
  }

}
