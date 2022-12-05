import { EventEmitter } from "events";
import noble from "@abandonware/noble";
import { Strip, StripType } from "./models";
import { isValid } from "./validation";

process.env.NOBLE_REPORT_ALL_HCI_EVENTS = "1";

const stripCache: {
    [uuid: string]: Strip
} = {};

const WRITE_CHAR_UUID = "000102030405060708090a0b0c0d2b11";

noble.on("discover", async peripheral => {
    const { uuid, address, advertisement } = peripheral;
    console.log(advertisement.localName, address);
    
    const model = isValid(peripheral);
    if (model === StripType.UNKNOWN) return;
    if (stripCache[uuid]) return;

    await peripheral.connectAsync();
    const chars = await peripheral.discoverSomeServicesAndCharacteristicsAsync([], [
        WRITE_CHAR_UUID
    ]);
    if (!chars.characteristics) return;
    const writeChar = chars.characteristics[0];

    // Create the lightstrip
    const strip = new Strip(uuid, advertisement.localName, model, writeChar);
    stripCache[strip.uuid] = strip;

    const interval = setInterval(() => strip.keepAlive(), 2000);
    peripheral.on("disconnect", () => {
        clearInterval(interval);
        delete stripCache[strip.uuid];
    });
});

noble.on("scanStart", () => {
    console.log("Scan started");
});

noble.on("scanStop", () => {
    console.log("Scan stopped");
});

export const startDiscovery = async () => {
    await noble.startScanningAsync([], false);
};

export const stopDiscovery = async () => {
    await noble.stopScanningAsync();
};