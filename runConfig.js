const FPSModileUrl = 'https://vizavi.github.io/testScripts/FPSMeasurer.js';
const scriptTestModuleUrl = 'https://vizavi.github.io/testScripts/scriptTest.js';

let FPSMeasurer, scriptTest;

(async () => {
    const FPSMeasurerModule = await import(FPSModileUrl);
    FPSMeasurer = FPSMeasurerModule.default;

    const sriptTestModule = await import(scriptTestModuleUrl);
    scriptTest = sriptTestModule.default;
})();

const test1 = new scriptTest('[class="right-resize-cursor handle handle-resize-side right"]');
const fpsMeasurer1 = new FPSMeasurer(['[class="right-resize-cursor handle handle-resize-side right"]', '[class="handle handle-push handle-drag-with-anchors showHover section"]']);
fpsMeasurer1.startMeasurement();


await test1.dragElementToSelector()

