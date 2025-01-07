import { Component, NgZone } from "@angular/core";
import {
  BarcodeTextPlacement,
  BarcodeTextPlacements,
  CapacitorThermalPrinter,
  DataCodeType,
  DataCodeTypes,
} from 'capacitor-thermal-printer';


@Component({
  templateUrl: './test.component.html',
  styleUrl: './test.component.scss'
})
export class TestComponent {
  busy = false
  messages: string[] = []
  devices: {name: string, address: string}[] = []

  constructor(
    private zone: NgZone
  ) {
    try {
      CapacitorThermalPrinter.addListener("discoverDevices", ({devices}) => {
        zone.run(() => {
          this.devices = devices
        })
      })
      CapacitorThermalPrinter.addListener("connected", () => {
        zone.run(() => {
          this.messages.push("connected")
        })
      })
      CapacitorThermalPrinter.addListener("disconnected", () => {
        zone.run(() => {
          this.messages.push("disconnected")
        })
      })
      CapacitorThermalPrinter.addListener("discoveryFinish", () => {
        zone.run(() => {
          this.messages.push("discoveryFinish")
        })
      })
    } catch (e) {
      this.messages.push(String(e))
    }
  }
  async handleClick() {
    if (this.busy) return
    this.busy = true
    this.devices = []
    this.messages.push("looking for printers")
    try {
      await CapacitorThermalPrinter.startScan()
      this.messages.push("think it worked")
    } catch(e) {
      this.messages.push(String(e))
    }


    /*try {
      const data = await BluetoothPrinter.list()
      for (const d of data.devices) {
        this.devices.push({name: d.name, address: d.address})
      }
      this.message = this.devices.length ? "" : "no devices found"
    } catch(e) {
      this.message = String(e)
    }*/


    this.busy = false
  }
}