import { Peripheral } from "@abandonware/noble";
import { StripType } from "./models";
import { Color } from "./models/Color";

export const isValid = (p: Peripheral) => {
    const { advertisement } = p;
    if (!advertisement.localName) return StripType.UNKNOWN;

    let stripType: keyof typeof StripType;
    for (stripType in StripType) {
        const type = StripType[stripType];
        if (advertisement.localName.includes(type)) {
            return type;
        }
    }

    return StripType.UNKNOWN;
};

export const isValidVal = (x: number) => {
    return (x >= 0 && x <= 0xFF);
};

export const isValidClr = (c: Color) => {
    const rIsValid = isValidVal(c.r);
    const gIsValid = isValidVal(c.g);
    const bIsValid = isValidVal(c.b);

    return rIsValid && gIsValid && bIsValid;
};