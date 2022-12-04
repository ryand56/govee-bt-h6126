import noble from "@abandonware/noble";

process.env.NOBLE_REPORT_ALL_HCI_EVENTS = "1";

noble.on("discover", peripheral => {
    const { address } = peripheral;
    console.log(address);
});

noble.on("scanStart", () => {
    console.log("Scan started");
    setTimeout(() => {
        noble.stopScanning();
    }, 8000);
});

noble.on("scanStop", () => {
    console.log("Scan stopped");
});

(async () => {
    await noble.startScanningAsync([], false);
})();