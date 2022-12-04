import StripType from "./StripType";
import MessageType from "./MessageType";
import { Characteristic } from "@abandonware/noble";
import { Color, xorClr, EMPTY_COLOR } from "./Color";

const CONTROL_PACKET_ID = 0x33;

interface StripProps {
    uuid: string
    name: string
    model: StripType
    writeChar: Characteristic
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
};

class Strip {
    /** @internal */
    state: StripProps;

    constructor(init: StripProps) {
        this.state = init;
    }

    /** @internal Sends a message over BLE */
    public async sendHex(message: string) {
        await this.state.writeChar.writeAsync(Buffer.from(message, "hex"), false);
    }

    public setBrightness(value: number) {
        //
    }

    public setPower(value: boolean) {
        //
    }

    public setColor(value: Color, isWhite: boolean) {
        //
    }

    public sendKeepAlive() {
        //
    }
}

export default Strip;