import { Component, NgZone } from '@angular/core';
import { ToastController } from '@ionic/angular';
import {
  BarcodeTextPlacement,
  BarcodeTextPlacements,
  CapacitorThermalPrinter,
  DataCodeType,
  DataCodeTypes,
} from 'capacitor-thermal-printer';

Object.assign(window, { CapacitorThermalPrinter });

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  DataCodeTypes = DataCodeTypes;
  BarcodeTextPlacements = BarcodeTextPlacements;

  selectedDataCodeType: DataCodeType = 'QR';
  devices: any = [];
  isScanning = false;
  isConnected = false;
  constructor(
    zone: NgZone,
    private toastController: ToastController,
  ) {
    CapacitorThermalPrinter.addListener('discoverDevices', async ({ devices }) => {
      zone.run(() => {
        this.devices = devices;
      });
    });
    CapacitorThermalPrinter.addListener('connected', async () => {
      zone.run(() => {
        this.isConnected = true;
      });
      const toast = await this.toastController.create({
        message: 'Connected!',
        duration: 1500,
        position: 'bottom',
        color: 'success',
      });

      await toast.present();
    });
    CapacitorThermalPrinter.addListener('disconnected', async () => {
      zone.run(() => {
        this.isConnected = false;
      });
      const toast = await this.toastController.create({
        message: 'Disconnected!',
        duration: 1500,
        position: 'bottom',
        color: 'warning',
      });

      await toast.present();
    });
    CapacitorThermalPrinter.addListener('discoveryFinish', () => {
      zone.run(() => {
        this.isScanning = false;
      });
    });
  }
  async connectDevice(device: any) {
    await CapacitorThermalPrinter.connect({
      address: device.address,
    });
  }
  startScan() {
    // startScan throws an error if it's already scanning
    if (this.isScanning) return;

    this.devices = [];
    CapacitorThermalPrinter.startScan().then(() => (this.isScanning = true));
  }
  stopScan() {
    // stopScan already dispatches the discoveryFinish event
    CapacitorThermalPrinter.stopScan();
  }
  disconnect() {
    CapacitorThermalPrinter.disconnect();
  }

  printImage() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';

    const fileHandler = () => {
      fileInput.removeEventListener('change', fileHandler);

      if (!fileInput.files!.length) return;

      CapacitorThermalPrinter.begin()
        .image(fileInput!.files![0])
        .write()
        .then(() => this.successPrintError())
        .catch((e) => this.catchPrintError(e));
    };
    fileInput.addEventListener('change', fileHandler);
    fileInput.click();
  }
  printText(text: string | null | undefined) {
    if (!text) return;
    if (!text.endsWith('\n')) text += '\n';

    CapacitorThermalPrinter.begin()
      .text(text)
      .write()
      .then(() => this.successPrintError())
      .catch((e) => this.catchPrintError(e));
  }
  printDataCode(data: string | null | undefined, placement: BarcodeTextPlacement | null) {
    if (!data) return;
    CapacitorThermalPrinter.begin().align('center');
    if (this.selectedDataCodeType === 'QR') {
      CapacitorThermalPrinter.qr(data);
    } else {
      if (placement) CapacitorThermalPrinter.barcodeTextPlacement(placement);
      CapacitorThermalPrinter.barcode(this.selectedDataCodeType, data);
    }
    CapacitorThermalPrinter.write()
      .then(() => this.successPrintError())
      .catch((e) => this.catchPrintError(e));
  }
  beep() {
    CapacitorThermalPrinter.begin()
      .beep()
      .write()
      .then(() => this.successPrintError())
      .catch((e) => this.catchPrintError(e));
  }
  cutPaper() {
    CapacitorThermalPrinter.begin()
      .feedCutPaper()
      .write()
      .then(() => this.successPrintError())
      .catch((e) => this.catchPrintError(e));
  }
  printShowcase() {
    CapacitorThermalPrinter.begin()
      .underline()
      .bold()
      .inverse()
      .font('A')
      .doubleWidth()
      .doubleHeight()
      .text('How did we get here?\n')
      .clearFormatting()
      .font('A')
      .text('Have every effect applied at the same time.\n')
      .font('B')
      .text('Have every effect applied at the same time.\n')
      .image(
        'data:image/png;base64,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d3d3LmdpbXAub3JnL3htcC8iCiAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyIKICAgIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIKICAgeG1wTU06RG9jdW1lbnRJRD0iZ2ltcDpkb2NpZDpnaW1wOmRjOWQzNTFkLWEwNGItNDk3ZC04NzEwLWNkY2ZmMzRlNjk2NSIKICAgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDoyZTUwYWRmMC02NTA1LTQxYmYtYjZmNC05Yzg1ZjJlNTcxZmEiCiAgIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDoyYmM2ZDU1YS1lMDc3LTQ4YmUtOWMxZC0xN2Q4YzA5NzVlZmEiCiAgIGRjOkZvcm1hdD0iaW1hZ2UvcG5nIgogICBHSU1QOkFQST0iMi4wIgogICBHSU1QOlBsYXRmb3JtPSJXaW5kb3dzIgogICBHSU1QOlRpbWVTdGFtcD0iMTcyOTIxNTU4NzI0Mzc4MyIKICAgR0lNUDpWZXJzaW9uPSIyLjEwLjMyIgogICB0aWZmOk9yaWVudGF0aW9uPSIxIgogICB4bXA6Q3JlYXRvclRvb2w9IkdJTVAgMi4xMCIKICAgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyNDoxMDoxOFQwNDozOTo0NiswMzowMCIKICAgeG1wOk1vZGlmeURhdGU9IjIwMjQ6MTA6MThUMDQ6Mzk6NDYrMDM6MDAiPgogICA8eG1wTU06SGlzdG9yeT4KICAgIDxyZGY6U2VxPgogICAgIDxyZGY6bGkKICAgICAgc3RFdnQ6YWN0aW9uPSJzYXZlZCIKICAgICAgc3RFdnQ6Y2hhbmdlZD0iLyIKICAgICAgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo2OGI3MzY1NC1jNjAyLTQwMGItYjEwNC05MWIxMTc2ODc5MDQiCiAgICAgIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkdpbXAgMi4xMCAoV2luZG93cykiCiAgICAgIHN0RXZ0OndoZW49IjIwMjQtMTAtMThUMDQ6Mzk6NDciLz4KICAgIDwvcmRmOlNlcT4KICAgPC94bXBNTTpIaXN0b3J5PgogIDwvcmRmOkRlc2NyaXB0aW9uPgogPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgIAo8P3hwYWNrZXQgZW5kPSJ3Ij8+oMX2nAAAAAZiS0dEAAAAAAAA+UO7fwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB+gKEgEnL/a1UfEAAAV4SURBVHja7Z3Pa11FFMc/JxQhf0FRujSr1EVBFy7qSrGglUpsRC34gwgK/ii1RCyBJBBEFATBRcWVkKD5UReKWlCpEIQiCSKmukjATayk2IVgW9qkHhe9gfTxcu/ce2fmznvvHBje4s6dc+Z8Z+b8mJn7RFWVDiIRyX3eYd2hDyMDwAAw6g4ARGRSRCZNrQ0AkCl+HBg3ECIDsEP522QgxAKgjfINhFgA5CjfQAgNgIPyDQQXPdaJhEXkAjDoWH1SVcdrC2yR8G2dHQQuOFa3mRDCCBsICbihBkICgZiBkEAqwkAoT3t8N6iqgyW9o7Lth3MJRY4BdwMDO34BVoG17V9VnfbZoSAErACaUyY0AQJGgMUCWduVRWCkNv/AnVtJUfnAQWAG2Kyg+NaymbV1MDkAdgGhaeWfBK57UHxruQ6cTA6AFhAmHOqWLV+VkGMhgOJby0IZ3dRKRZTNHbmkIopSDVWNsoisA/siOTfrqurEK9qWpI88UBt621H5KxGVD7Av45kOAAFoQ1VPOSh/DNjfgHz7M95dC8CMg/KHgakGZZzKZAiTjg5kK7yt/SJyDehvuEvXVLW/22bAZw7KnwusfNeB25/J0lUAuKQChgLy3wSGgXnH+kPRUxHZ0nY8C9kvefSzrzjwHQ3o518BjuzgNef43mjUQMwhF1S1nHPgvRyI9z/AI234uYCwHA0A4KeAI3AqQDTtUv4GHs7hWQhCO/JuA0RkCLgv4Pr7nUNK2XvMAQyr6tmcOguO6e7gRviJwBH1uYIqAxWa/Tzn2Z+Z8r/PUezTwKwDn4HgRhj4N2Syy4H/dMk2n8neO9vm2R8O/I6V4DUd1AYAL4fONjrIcL5EeyMt7+7cmFl14PVsSfnPhwbg6wQAuOzY1mu7vP8z8LsDn+cryH85NABF5VCEvQcXAE552MZUHwD4vB9QlJncUtVvIkTJqw517qjRz5eAj33J5tMLOlzw/INIaYo1hzqVjsSIyCvAaZ+y+QTg/gL38Y1IAKw61isFgoi8DnzoWzZfN2TeLajyS8RE3VqJuk4giMgJTzN4LUgcAPxWYHxeiHzyoWyZKDhFEcyDw0NnH6zrOgYAYNEHCMCbHl3oxVC5oKMFzz9tYL/gkwrv3LYcZfu574SWqfaWpIj8BdyZU+VQQRIr1NbmFtXOvk4C/2W/vmhLVfd435ABHi+YdpcaPAE3Q/hDWK5lZjc56y5BTxY8/6jBbcvTwI0Etk9v5MYONUfZ1ZSMb0gPpkbJPS9a55rqc+SfOvih6aGnqu8BZxoU4Uwmw65UZwl6qsYmR0wQhoD1BlivZ7zzB3JVL6jT7utmZzVjHVFcUVUnXn0VO/NqQZU5EqNMIWMRWI25Kr+yEQZ+TMjFK5XfzwLHqwFkuAocjXJBIzHlb5fjJfswC2x54LsFzEa7Iwa8lSgACjxaoT+jVDvItcwup92C3pARkV+Be0iU6hj/7NzO9hXVdtdU17i1We/tmmoVAEidOumLKV351UQRQUQeMgCapW9drgg1Pli6cQlqoS9V9XDPANBpX6yyJai7bM/7NgPiK/0EcAR4oEr/DYDyCn8ROMCtc1AH6vY/OAAVjPZFYElVH/OsuC+Ae4G76sQUvgdgigB4n00+ZfANQF/i030+hTY62g2tGTdsqOremgBsAHttBlSjm4m00bNxwFIibfTmEmRGuBnaAOZ9xhNZW/NZ2701A7owEOspI9z1ZAAYAL1N3r8d3YEbNjYDDAAjA8AAMDIADAAjA8DiAM/U6bmh0HGNzQBbggwAow4D4GKguqlS0P5WAWApUN1UKWh/K90T9vknC93kCVXpbyUbULDH6n1Pt2kK2d/k/sLEjLCRAWAAGEWj/wEHMKNjSqX0wAAAAABJRU5ErkJggg==',
      )
      .beep()
      .beep()
      .write()
      .then(() => this.successPrintError())
      .catch((e) => this.catchPrintError(e));
  }

  private async successPrintError() {
    const toast = await this.toastController.create({
      message: 'Success',
      duration: 1500,
      position: 'bottom',
      color: 'success',
    });

    await toast.present();
  }
  private async catchPrintError(error: Error) {
    const toast = await this.toastController.create({
      message: 'Error: ' + error.message,
      duration: 1500,
      position: 'bottom',
      color: 'danger',
    });

    await toast.present();
  }
}
