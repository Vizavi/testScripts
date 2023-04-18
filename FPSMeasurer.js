class FPSMeasurer {
    constructor(selectors = [], runTestonReady = '', beforeDUration = 5, afterDuration = 5) {
        this.fpsData = [];
        this.frameCount = 0;
        this.secondsCount = 0;
        this.measuring = true;
        this.boundEventHandlers = [];
        this.selectors = selectors;
        this.beforeDuration = beforeDUration;
        this.afterDuration = afterDuration;
        this.runTestonReady = runTestonReady;
    }

    measureFPS() {
        this.frameCount++;
        requestAnimationFrame(() => {
            if (this.measuring) {
                this.measureFPS();
            }
        });
    }

    async saveFPSData() {
        while (this.measuring) {
            if (this.secondsCount == this.beforeDuration) {
                console.log(' ! ! Ready to start ! ! ');
                if (this.runTestonReady)
                    this.runTestonReady();
            }
            this.fpsData.push({ second: this.secondsCount, fps: this.frameCount });
            this.frameCount = 0;
            this.secondsCount++;
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    }

    calculateAverageFPS(data) {
        const sum = data.reduce((accumulator, currentValue) => {
            return accumulator + currentValue.fps;
        }, 0);
        return sum / data.length;
    }

    observeDOMChanges(callback) {
        const observer = new MutationObserver((mutationsList) => {
            callback(mutationsList);
        });

        const config = { childList: true, subtree: true, attributes: true, characterData: true };
        observer.observe(document.body, config);

        return observer;
    }

    async handleMouseDown(handladSelector = 'unknown') {
        console.log(`TIME FRAME (second): ${this.secondsCount} | START INTERACTION WITH SELECTOR: ${handladSelector}`)
        let domChangesBefore = 0;
        let domChangesDuring = 0;
        let domChangesAfter = 0;

        const baseLine = this.fpsData.slice(-this.beforeDuration);
        const interactionStartIndex = this.fpsData.length;

        const observer = this.observeDOMChanges((mutationsList) => {
            domChangesBefore += mutationsList.length;
        });

        async function handleMouseUp() {
            await new Promise((resolve) => setTimeout(resolve, 1000));

            console.log(`TIME FRAME (second): ${this.secondsCount} | END INTERACTION WITH SELECTOR: ${handladSelector}`)
            const interactionEndIndex = this.fpsData.length;

            const testData = this.fpsData.slice(interactionStartIndex, this.fpsData.length);

            const averageBaseLine = this.calculateAverageFPS(baseLine);
            const averageTestData = this.calculateAverageFPS(testData);

            observer.disconnect();

            const observerDuring = this.observeDOMChanges((mutationsList) => {
                domChangesDuring += mutationsList.length;
            });

            await new Promise((resolve) => setTimeout(resolve, testData.length * 1000));
            
            observerDuring.disconnect();
            document.removeEventListener('mouseup', handleMouseUp.bind(this));

            const observerAfter = this.observeDOMChanges((mutationsList) => {
                domChangesAfter += mutationsList.length;
            });
            await new Promise((resolve) => setTimeout(resolve, this.afterDuration * 1000));

            observerAfter.disconnect();
            this.measuring = false;

            const afterData = this.fpsData.slice(interactionEndIndex, interactionEndIndex + this.afterDuration);
            const averageAfterData = this.calculateAverageFPS(afterData);



            console.log('BEFORE INTERACTION ', 'Average FPS:', averageBaseLine, 'DOM Changes:', domChangesBefore);
            console.table(baseLine);

            console.log('INTERACTION ', 'Average FPS:', averageTestData, 'DOM Changes:', domChangesDuring);
            console.table(testData);

            console.log('AFTER INTERACTION ', 'Average FPS:', averageAfterData, 'DOM Changes:', domChangesAfter);
            console.table(afterData);

           

            const lastRunResults = {
                '00_beforeInteraction': {
                    data: baseLine,
                    averageFPS: averageBaseLine,
                    domChanges: domChangesBefore,
                },
                '01_testData': {
                    data: testData,
                    averageFPS: averageTestData,
                    domChanges: domChangesDuring,
                },
                '02_afterInteraction': {
                    data: afterData,
                    averageFPS: averageAfterData,
                    domChanges: domChangesAfter,
                },
            };

            const oldResaults = Array.from(JSON.parse(localStorage.getItem('FPSMeasurementResults')) || []);

            const newResults = [...oldResaults, lastRunResults];

            localStorage.setItem('FPSMeasurementResults', JSON.stringify(newResults));
        }

        document.addEventListener('mouseup', handleMouseUp.bind(this));
    }

    showResults() {
        const savedResults = JSON.parse(localStorage.getItem('FPSMeasurementResults'));
        console.log(savedResults);
    }

    resetLocalStorage() {
        localStorage.removeItem('FPSMeasurementResults');
    }

    removeEventListeners() {
        this.boundEventHandlers.forEach(({ element, handler }) => {
            element.removeEventListener('mousedown', handler);
            element.removeEventListener('mouseUp', handler);

        });
        this.boundEventHandlers = [];
    }

    resetData() {
        this.removeEventListeners();
        this.fpsData = [];
        this.frameCount = 0;
        this.secondsCount = 0;
    }

    startMeasurement() {
        this.resetData();

        this.measureFPS();
        this.saveFPSData();

        this.selectors.forEach((selector) => {
            const elements = document.querySelectorAll(selector);
            elements.forEach((element) => {
                const boundHandler = () => this.handleMouseDown();
                element.addEventListener('mousedown', () => this.handleMouseDown(selector));
                console.log('EVENT LISTINER IS ATTACHED TO SELECTOR:' + selector);
                this.boundEventHandlers.push({ element, handler: boundHandler });
            });
        });
    }
}

export default FPSMeasurer;

//const fpsMeasurer1 = new FPSMeasurer(['[class="right-resize-cursor handle handle-resize-side right"]', '[class="handle handle-push handle-drag-with-anchors showHover section"]']);
//fpsMeasurer1.startMeasurement();

