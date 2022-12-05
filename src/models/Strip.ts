import { hexify } from "../utils";
import StripType from "./StripType";
import MessageType from "./MessageType";
import { Characteristic } from "@abandonware/noble";
import { Color, xorClr, EMPTY_COLOR, INIT_COLOR, hexToClr, clrToHex } from "./Color";

const CONTROL_PACKET_ID = 0x33;
const KEEP_ALIVE_PACKET = "aa010000000000000000000000000000000000ab";

interface StripState {
    color: Color
    isWhite: boolean
    brightness: number
    power: boolean
}

interface ChecksumMessageOptions {
    type: MessageType
    specialByte: number
    rgbColor: Color
    flag: number
    whiteColor: Color
}

const checksumMessage = (options: ChecksumMessageOptions) => {
    const checksum = 
        CONTROL_PACKET_ID ^ options.type ^ options.specialByte ^ xorClr(options.rgbColor) ^ options.flag ^ xorClr(options.whiteColor);
    
    return hexify(CONTROL_PACKET_ID)
        + hexify(options.type)
        + hexify(options.specialByte)
        + clrToHex(options.rgbColor)
        + hexify(options.flag)
        + clrToHex(options.whiteColor)
        + "000000000000000000"
        + hexify(checksum);
};

class Strip {
    uuid: string;
    name: string;
    model: StripType;
    writeChar: Characteristic;
    state: StripState = {
        color: INIT_COLOR,
        isWhite: true,
        brightness: 0xFF,
        power: true
    };

    constructor(uuid: string, name: string, model: StripType, writeChar: Characteristic, state?: StripState) {
        this.uuid = uuid;
        this.name = name;
        this.model = model;
        this.writeChar = writeChar;
        if (state) this.state = state;

        // Set initial state
        this.setColor(this.state.color, this.state.isWhite);
        this.setBrightness(this.state.brightness);
        this.setPower(this.state.power);
    }

    /** @internal Sends a message over BLE */
    public async sendHex(message: string) {
        await this.writeChar.writeAsync(Buffer.from(message, "hex"), false);
    }

    /**
     * Sets the brightness for this lightstrip.
     * @param value The brightness to set on the lightstrip.
     * @returns A promise that is resolved when the brightness has been sent.
     */
    public async setBrightness(value: number) {
        const message = checksumMessage({
            type: MessageType.BRIGHTNESS,
            specialByte: value,
            rgbColor: EMPTY_COLOR,
            flag: 0x0,
            whiteColor: EMPTY_COLOR
        });

        await this.sendHex(message);
        this.state.brightness = value;
    }

    /**
     * Sets the power for this lightstrip.
     * @param value The power to set on the lightstrip.
     * @returns A promise that is resolved when the power has been sent.
     */
    public async setPower(value: boolean) {
        const flag = value ? 1 : 0;
        const message = checksumMessage({
            type: MessageType.POWER,
            specialByte: flag,
            rgbColor: EMPTY_COLOR,
            flag: 0x0,
            whiteColor: EMPTY_COLOR
        });

        await this.sendHex(message);
        this.state.power = value;
    }

    /**
     * Sets the color for this lightstrip.
     * @param value The color to set on the lightstrip.
     * @param isWhite A boolean that describes if the color is a shade of white.
     * @returns A promise that is resolved when the color has been sent.
     */
    public async setColor(value: Color, isWhite: boolean) {
        const message = checksumMessage({
            type: MessageType.COLOR,
            specialByte: 0x2,
            rgbColor: isWhite ? EMPTY_COLOR : value,
            flag: isWhite ? 0x1 : 0x0,
            whiteColor: isWhite ? value : EMPTY_COLOR
        });
        
        await this.sendHex(message);
        this.state.color = value;
    }

    /**
     * Keeps the connection alive by sending a special packet.
     */
    public async keepAlive() {
        await this.sendHex(KEEP_ALIVE_PACKET);
    }
}

export default Strip;
