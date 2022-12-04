const hexify = (x: number) => {
    const toReturn = x.toString(16);
    return toReturn.length < 2 ? "0" + toReturn : toReturn;
};

export default hexify;
