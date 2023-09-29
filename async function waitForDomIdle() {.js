async function waitForDomIdle() {
    const validationStartTime = Date.now();
    let previousDomChangeTimeStamp = Date.now();
    let lastDomChangeTimeStamp = Date.now();
    let mutationsObserved = false;
    let _resolve;


    const observerOptions = {
        childList: true,
        subtree: true
    }

    const validationRunTime = (consoleNotes = 'N/A') => {
        const runTime = Date.now() - validationStartTime;
        console.log(consoleNotes, 'runTime:', runTime);
        return runTime;
    }

    const observer = new window.MutationObserver((mutationsList, observer) => {
        mutationsObserved = true;
        lastDomChangeTimeStamp = Date.now();
    });

    const domChangesInterval = () => {
        console.log('lastDomChangeTimeStamp:', lastDomChangeTimeStamp);
        console.log('previousDomChangeTimeStamp:', previousDomChangeTimeStamp);
        const result = Number(lastDomChangeTimeStamp) - Number(previousDomChangeTimeStamp);
        console.log('result:', result);
        return result
    }

    const domLoadIdle = (expectedDomIdleTime = 5000, observerStatus = false, validationTimeOut = 30000) => {
        validationRunTime('DOme Laden Idle');

        if (!observerStatus) {
            console.log('Start Observer!!!!');
            validationRunTime('Start Observer!!!!');
            observer.observe(document.body, observerOptions);
            return domLoadIdle(5000, true);
        }
        return setTimeout(function () {
            const domIsIdle = domChangesInterval() >= expectedDomIdleTime;
            const timeOutReached = Date.now() - validationStartTime >= validationTimeOut;
            validationRunTime('time out function');
            console.log('domIsIdle:', domIsIdle);
            console.log('timeOutReached:', timeOutReached);

            if (timeOutReached) {
                validationRunTime('tim out reached');
                console.log('TIMEOUT!!!!');
                observer.disconnect()
                _resolve('false');
            }
            else if (domIsIdle) {
                validationRunTime('Dom is idle');
                console.log('HPPY!!!!');
                observer.disconnect()
                _resolve('true');
            }
            validationRunTime('Reassin dom time stamps');
            previousDomChangeTimeStamp = lastDomChangeTimeStamp;
        }, expectedDomIdleTime);
    }

    return new Promise(resolve => {
        validationRunTime('initial promise');
        _resolve = resolve;
        return domLoadIdle(5000, false);
    });
}