import { Component } from "@angular/core";
import { BleClient, numbersToDataView, numberToUUID } from '@capacitor-community/bluetooth-le';

@Component({
  templateUrl: './test2.component.html',
  styleUrl: './test2.component.scss'
})
export class Test2Component {
  busy = false
  private _initialized = false
  devices: {
    id: string
    name: string
  }[] = []
  messages: string[] = []
  serviceId = "0x1118"
  constructor(

  ) {}

  private async _initialize() {
    if (this._initialized) return
    this._initialized = true
    await BleClient.initialize()
  }

  async handleClick() {
    if (this.busy) return
    this.busy = true
    await this._initialize()

    const devs = await BleClient.getConnectedDevices([numberToUUID(Number(this.serviceId))])
    this.devices = []
    for (const d of devs) {
      this.devices.push({
        id: d.deviceId,
        name: d.name ?? ""
      })
    }
    this.busy = false
  }
}