import { EventEmitter } from "events";
import noble from "@abandonware/noble";
import { Strip, StripType } from "./models";
import { isValid } from "./validation";

process.env.NOBLE_REPORT_ALL_HCI_EVENTS = "1";

const WRITE_CHAR_UUID = "000102030405060708090a0b0c0d2b11";

export declare interface StripControl {
    on(event: "deviceFound", listener: (p: noble.Peripheral) => void): this;
    on(event: "stripFound", listener: (strip: Strip) => void): this;
}

export class StripControl extends EventEmitter {
    private cache: {
        [uuid: string]: Strip
    } = {};

    private async _onDiscover(peripheral: noble.Peripheral) {
        const { uuid, address, advertisement } = peripheral;
        console.log(advertisement.localName, address);
        
        const model = isValid(peripheral);
        if (model === StripType.UNKNOWN) return;
        if (this.cache[uuid]) return;
    
        await peripheral.connectAsync();
        const chars = await peripheral.discoverSomeServicesAndCharacteristicsAsync([], [
            WRITE_CHAR_UUID
        ]);
        if (!chars.characteristics) return;
        const writeChar = chars.characteristics[0];
    
        // Create the lightstrip
        const strip = new Strip(uuid, advertisement.localName, model, writeChar);
        this.cache[strip.uuid] = strip;
    
        const interval = setInterval(() => strip.keepAlive(), 2000);
        peripheral.on("disconnect", () => {
            clearInterval(interval);
            delete this.cache[strip.uuid];
        });
        peripheral.on("connect", () => { this.emit("stripFound", strip) });
    };

    private _onScanStart() {
        console.log("Scan started");
    };

    private _onScanStop() {
        console.log("Scan stopped");
    }

    constructor() {
        super();
    }

    public async startDiscovery() {
        noble.on("discover", this._onDiscover);
        noble.on("scanStart", this._onScanStart);
        noble.on("scanStop", this._onScanStop);
        await noble.startScanningAsync([], false);
    }

    public async stopDiscovery() {
        await noble.stopScanningAsync();
        noble.removeListener("discover", this._onDiscover);
        noble.removeListener("scanStart", this._onScanStart);
        noble.removeListener("scanStop", this._onScanStop);
    }
};
