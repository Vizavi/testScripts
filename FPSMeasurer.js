class FPSMeasurer {
    constructor(selectors, beforeDUration = 10, afterDuration = 10) {
        this.fpsData = [];
        this.frameCount = 0;
        this.secondsCount = 0;
        this.measuring = true;
        this.selectors = selectors;
        this.beforeDuration = beforeDUration;
        this.afterDuration = afterDuration;
        this.boundEventHandlers = [];
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
                alert('Ready to start');
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

            const observerAfter = this.observeDOMChanges((mutationsList) => {
                domChangesAfter += mutationsList.length;
            });
            await new Promise((resolve) => setTimeout(resolve, this.afterDuration * 1000));
            observerAfter.disconnect();
            this.measuring = false;

            console.log('interactionEndIndex' + interactionEndIndex, 'this.afterDuration' + this.afterDuration,)

            const afterData = this.fpsData.slice(interactionEndIndex, interactionEndIndex + this.afterDuration);
            const averageAfterData = this.calculateAverageFPS(afterData);



            console.log('BEFORE INTERACTION ', 'Average FPS:', averageBaseLine, 'DOM Changes:', domChangesBefore);
            console.table(baseLine);

            console.log('INTERACTION ', 'Average FPS:', averageTestData, 'DOM Changes:', domChangesDuring);
            console.table(testData);

            console.log('AFTER INTERACTION ', 'Average FPS:', averageAfterData, 'DOM Changes:', domChangesAfter);
            console.table(afterData);

            console.log(this.fpsData);

            document.removeEventListener('mouseup', handleMouseUp.bind(this));
        }

        document.addEventListener('mouseup', handleMouseUp.bind(this));
    }

    removeEventListeners() {
        this.boundEventHandlers.forEach(({ element, handler }) => {
            element.removeEventListener('mousedown', handler);
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

export default { FPSMeasurer };

//const fpsMeasurer1 = new FPSMeasurer(['[class="right-resize-cursor handle handle-resize-side right"]', '[class="handle handle-push handle-drag-with-anchors showHover section"]']);
//fpsMeasurer1.startMeasurement();

