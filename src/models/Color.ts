import { hexify } from "../utils";

export interface Color {
    r: number
    g: number
    b: number
}

export const xorClr = (c: Color) => {
    return c.r ^ c.b ^ c.g;
};

export const clrToHex = (c: Color) => {
    const rHex = hexify(c.r);
    const gHex = hexify(c.g);
    const bHex = hexify(c.b);

    return rHex + gHex + bHex;
};

export const hexToClr = (s: string): Color => {
    const r = Number(`0x${s.substring(0,2)}`);
    const g = Number(`0x${s.substring(2,4)}`);
    const b = Number(`0x${s.substring(4,6)}`);

    return { r, g, b };
};

export const EMPTY_COLOR: Color = { r: 0xFF, g: 0xFF, b: 0xFF };