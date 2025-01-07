import { Component, NgZone } from "@angular/core";
import { BleClient, numbersToDataView, numberToUUID } from '@capacitor-community/bluetooth-le';

@Component({
  templateUrl: './test2.component.html',
  styleUrl: './test2.component.scss'
})
export class Test2Component {
  scanning = false
  private _initialized = false
  devices: {
    id: string
    name: string
  }[] = []
  messages: string[] = []
  serviceId = "0x1118"
  constructor(
    private zone: NgZone
  ) {}

  private async _initialize() {
    if (this._initialized) return
    this._initialized = true
    await BleClient.initialize()
  }

  async startScan() {
    if (this.scanning) return
    this.scanning = true
    await this._initialize()
    this.devices = []
    BleClient.requestLEScan({}, res => {
      this.zone.run(() => {
        const devs = [...this.devices]
        devs.push({
          id: res.device.deviceId,
          name: res.device.name ?? ""
        })
        this.devices = devs
      })
    })

  }

  async stopScan() {
    if (!this.scanning) return
    this.scanning = false
    BleClient.stopLEScan()
  }
}