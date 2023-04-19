class scriptTest {
    constructor(selector, targetX = 700, targetY = 500, steps = 77, duration = 1731) {
        this.selector = selector;
        this.targetX = targetX;
        this.targetY = targetY;
        this.steps = steps;
        this.duration = duration;
    }

    triggerMouseEvent(element, eventType, options) {
        const event = new MouseEvent(eventType, {
            bubbles: true,
            cancelable: true,
            ...options
        });
        element.dispatchEvent(event);
    }

    async dragElementToCoordinates() {
       // const previewFrame = document.getElementById('preview');
      //  const element = previewFrame.contentDocument.querySelector(this.selector);
      const element = document.querySelector(this.selector);

        if (!element) {
            console.error('Element not found for selector:', this.selector);
            return;
        }

        const rect = element.getBoundingClientRect();
        const startX = rect.left + window.pageXOffset;
        const startY = rect.top + window.pageYOffset;

        this.triggerMouseEvent(element, 'mousedown', { clientX: startX, clientY: startY });

        const stepDuration = this.duration / this.steps;
        for (let i = 1; i <= this.steps; i++) {
            const currentX = startX + (this.targetX - startX) * (i / this.steps);
            const currentY = startY + (this.targetY - startY) * (i / this.steps);
            this.triggerMouseEvent(element, 'mousemove', { clientX: currentX, clientY: currentY });
            await new Promise((resolve) => setTimeout(resolve, stepDuration));
        }

        this.triggerMouseEvent(element, 'mouseup', { clientX: this.targetX, clientY: this.targetY });
    }
}

export default scriptTest;

//const test1 = new scriptTest('[class="right-resize-cursor handle handle-resize-side right"]', 650, 500);
//await test1.dragElementToSelector()
