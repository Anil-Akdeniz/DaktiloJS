class DaktiloJS {
    constructor(el, options = {}) {
        if (!el) {
            console.error('DaktiloJS: A valid DOM element is required.');
            throw new Error('A valid DOM element is required.');
        }

        this.el = el;
        this.options = Object.assign(
            {
                sentences: [],
                queue: [],
                typeSpeed: 100,
                deleteSpeed: 50,
                pauseBetween: 2000,
                loop: true,
                sound: false,
                soundFile: DaktiloJS.defaultTypingSound,
                soundLevel: 0.5,
                carriageReturnSound: DaktiloJS.defaultCarriageReturnSound,
                showCursor: true,
                cursorChar: '|',
                cursorBlinkDuration: 0.7,
                startDelay: 0,
                debugger: false,
                showSoundPrompt: false,
                soundPromptPosition: 'bottom-right',
                adaptiveSound: false,
                maxSoundDistance: 1000,
                
            },
            options
        );

        if (!Array.isArray(this.options.sentences) && !Array.isArray(this.options.queue)) {
            console.error('DaktiloJS: Either "sentences" or "queue" option must be a non-empty array.');
            throw new Error('Either "sentences" or "queue" option must be a non-empty array.');
        }

        this.typeSpeed = this.options.typeSpeed;
        this.deleteSpeed = this.options.deleteSpeed;
        this.pauseBetween = this.options.pauseBetween;
        this.loop = this.options.loop;
        this.sound = this.options.sound;
        this.soundLevel = this.options.soundLevel;
        this.maxSoundDistance = this.options.maxSoundDistance;
        this.typingSound = this.loadSound(this.options.soundFile, this.soundLevel);
        this.carriageReturnSound = this.loadSound(this.options.carriageReturnSound, this.soundLevel);
        this.adaptiveSound = this.options.adaptiveSound;

        this.queue = [];
        this.isProcessingQueue = false;
        this.currentQueueItem = null;
        this.currentText = '';
        this.currentSentenceIndex = 0;

        if (Array.isArray(this.options.sentences) && this.options.sentences.length > 0) {
            this.initializeSentencesQueue();
        } else if (Array.isArray(this.options.queue) && this.options.queue.length > 0) {
            this.queue = this.processQueueInput(this.options.queue);
        }

        this.injectHTML();
        if (this.options.showSoundPrompt) {
            this.injectSoundPrompt();
        }

        if (this.sound && this.adaptiveSound) {
            this.initializeDistanceBasedSound();
        }
        this.injectHTML();
        if (this.options.showCursor) {
            this.injectCursorCSS();
        }
        setTimeout(() => this.startProcessingQueue(), this.options.startDelay);
    }

    initializeSentencesQueue() {
        this.queue = [];
        this.options.sentences.forEach((sentence, index) => {
            if (index === 0) {
                this.queue.push({ type: 'type', content: sentence });
            } else {
                this.queue.push({ type: 'deleteAll' });
                this.queue.push({ type: 'pause', duration: 500 });
                this.queue.push({ type: 'type', content: sentence });
            }
            this.queue.push({ type: 'pause', duration: this.pauseBetween });
        });
        if (this.loop) {
            this.queue.push({ type: 'deleteAll' });
            this.queue.push({ type: 'pause', duration: 500 });
        }
    }
    injectCursorCSS() {
        const cursorStyleId = `daktilojs-cursor-style-${Math.random().toString(36).substr(2, 9)}`;
        if (!document.querySelector(`#${cursorStyleId}`)) {
            const style = document.createElement('style');
            style.id = cursorStyleId;
            style.textContent = `
                .daktilojs-cursor-${cursorStyleId} {
                    display: inline-block;
                    animation: blink-${cursorStyleId} ${this.options.cursorBlinkDuration}s steps(2, start) infinite;
                    color: #000;
                }

                @keyframes blink-${cursorStyleId} {
                    0%, 50% { opacity: 1; }
                    50.01%, 100% { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
            this.el.querySelector('.daktilojs-cursor').classList.add(`daktilojs-cursor-${cursorStyleId}`);
        }
    }
    initializeDistanceBasedSound() {
        const updateVolume = (event) => {
            const elementRect = this.el.getBoundingClientRect();
            const elementCenter = {
                x: elementRect.left + elementRect.width / 2,
                y: elementRect.top + elementRect.height / 2
            };

            const distance = Math.sqrt(
                Math.pow(event.clientX - elementCenter.x, 2) +
                Math.pow(event.clientY - elementCenter.y, 2)
            );

            const volume = Math.max(0, 1 - (distance / this.maxSoundDistance));
            this.updateSoundVolume(volume);
        };

        document.addEventListener('mousemove', updateVolume);
    }

    updateSoundVolume(volume) {
        const targetVolume = volume * this.soundLevel;
        if (this.typingSound) {
            this.typingSound.volume = targetVolume;
        }
        if (this.carriageReturnSound) {
            this.carriageReturnSound.volume = targetVolume;
        }
    }

    processQueueInput(queueInput) {
        return queueInput.map(item => {
            if (typeof item === 'string') {
                return { type: 'type', content: item };
            }
            return item;
        });
    }

    injectHTML() {
        this.el.classList.add('daktilojs-container');
        this.el.innerHTML = `
            <span class="daktilojs-text"></span>
            ${this.options.showCursor ? `<span class="daktilojs-cursor">${this.options.cursorChar}</span>` : ''}
        `;

        DaktiloJS.injectCSS();
        this.textElement = this.el.querySelector('.daktilojs-text');
    }

    injectSoundPrompt() {
        const prompt = document.createElement('div');
        prompt.classList.add('daktilojs-sound-prompt');
        prompt.textContent = 'Click here to enable sound';

        const positionStyles = this.getPromptPositionStyles(this.options.soundPromptPosition);
        prompt.style.cssText = `
            position: fixed;
            ${positionStyles}
            background: #000;
            color: #fff;
            padding: 10px;
            border-radius: 5px;
            cursor: pointer;
            z-index: 1000;
        `;

        prompt.addEventListener('click', () => {
            if (this.typingSound) this.typingSound.play();
            if (this.carriageReturnSound) this.carriageReturnSound.play();
            prompt.remove();
        });

        document.body.appendChild(prompt);
    }

    getPromptPositionStyles(position) {
        switch (position) {
            case 'top-left':
                return 'top: 10px; left: 10px;';
            case 'top-right':
                return 'top: 10px; right: 10px;';
            case 'bottom-left':
                return 'bottom: 10px; left: 10px;';
            case 'bottom-right':
            default:
                return 'bottom: 10px; right: 10px;';
        }
    }

    static injectCSS() {
        if (document.querySelector('#daktilojs-style')) return;

        const style = document.createElement('style');
        style.id = 'daktilojs-style';
        style.textContent = `
            .daktilojs-container {
                display: inline-block;
                font-size: 24px;
                white-space: nowrap;
                overflow: hidden;
            }
            .daktilojs-text {
                display: inline-block;
            }
        `;
        document.head.appendChild(style);
    }

    loadSound(filePath, volume) {
        if (filePath) {
            try {
                const audio = new Audio(filePath);
                audio.preload = 'auto';
                audio.volume = volume;
                return audio;
            } catch (error) {
                console.error('DaktiloJS: Failed to load audio file:', filePath, error);
            }
        }
        return null;
    }

    playSound(sound) {
        if (sound) {
            try {
                sound.currentTime = 0;
                sound.play();
            } catch (error) {
                console.error('DaktiloJS: Failed to play sound.', error);
            }
        }
    }

    logDebug(message, additionalData = null) {
        if (this.options.debugger) {
            const timestamp = new Date().toISOString();
            console.log(`[DaktiloJS - ${timestamp}]: ${message}`, additionalData || '');
        }
    }

    startProcessingQueue() {
        if (!this.isProcessingQueue && this.queue.length > 0) {
            this.isProcessingQueue = true;
            this.processNextQueueItem();
        }
    }

    processNextQueueItem() {
        if (this.queue.length === 0) {
            this.isProcessingQueue = false;
            if (this.loop) {
                if (Array.isArray(this.options.sentences) && this.options.sentences.length > 0) {
                    this.initializeSentencesQueue();
                } else if (Array.isArray(this.options.queue) && this.options.queue.length > 0) {
                    this.queue = this.processQueueInput(this.options.queue);
                }
                this.startProcessingQueue();
            }
            return;
        }

        this.currentQueueItem = this.queue.shift();
        this.logDebug('Processing queue item', this.currentQueueItem);

        switch (this.currentQueueItem.type) {
            case 'type':
                this.typeText(this.currentQueueItem.content);
                break;
            case 'delete':
                this.deleteText(this.currentQueueItem.chars);
                break;
            case 'deleteAll':
                this.deleteText(this.currentText.length);
                break;
            case 'pause':
                setTimeout(() => this.processNextQueueItem(), this.currentQueueItem.duration);
                break;
        }
    }

    typeText(text, currentIndex = 0) {
        if (currentIndex < text.length) {
            this.currentText += text[currentIndex];
            this.textElement.innerText = this.currentText;
            if (this.sound && this.typingSound) this.playSound(this.typingSound);
            
            setTimeout(() => this.typeText(text, currentIndex + 1), this.typeSpeed);
        } else {
            setTimeout(() => this.processNextQueueItem(), this.pauseBetween);
        }
    }

    deleteText(chars = null) {
        const deleteChar = () => {
            if (this.currentText.length > 0 && (chars === null || this.currentText.length > this.startLength - chars)) {
                this.currentText = this.currentText.slice(0, -1);
                this.textElement.innerText = this.currentText;
                if (this.sound && this.typingSound) this.playSound(this.typingSound);
                setTimeout(deleteChar, this.deleteSpeed);
            } else {
                setTimeout(() => this.processNextQueueItem(), 500);
            }
        };

        this.startLength = this.currentText.length;
        deleteChar();
    }

    static init(selector = '.daktilojs', options = {}) {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) {
            console.warn('DaktiloJS: No elements found with selector:', selector);
            return;
        }
        elements.forEach(el => new DaktiloJS(el, options));
    }
}

DaktiloJS.defaultTypingSound = "data:audio/wav;base64,SUQzAwAAAABYG1RMRU4AAAAFAAAAODc1AFRJVDIAAAAZAAAAVHlwZXdyaXRlciBrZXkgKFNpbmdsZSkAVFBFMQAAABIAAABFcGljIFN0b2NrIE1lZGlhAFRTU0UAAAAPAAAATGF2ZjU4LjIwLjEwMABBUElDAAAroAAAAGltYWdlL3BuZwAAAIlQTkcNChoKAAAADUlIRFIAAAIAAAACAAgGAAAA9HjU+gAAAAFzUkdCAK7OHOkAACAASURBVHhe7d3t2VxHbi1QOgCHZGVlBeGwHJIVgP3QlkY0h2R/bRSqUOv+nfOiuhbQOLs58/j+y3/927//9xf/jwABAgQIELhK4F8EgKv67bIECBAgQOB/BQQAg0CAAAECBC4UEAAubLorEyBAgAABAcAMECBAgACBCwUEgAub7soECBAgQEAAMAMECBAgQOBCAQHgwqa7MgECBAgQEADMAAECBAgQuFBAALiw6a5MgAABAgQEADNAgAABAgQuFBAALmy6KxMgQIAAAQHADBAgQIAAgQsFBIALm+7KBAgQIEBAADADBAgQIEDgQgEB4MKmuzIBAgQIEBAAzAABAgQIELhQQAC4sOmuTIAAAQIEBAAzQIAAAQIELhQQAC5suisTIECAAAEBwAwQIECAAIELBQSAC5vuygQIECBAQAAwAwQIECBA4EIBAeDCprsyAQIECBAQAMwAAQIECBC4UEAAuLDprkyAAAECBAQAM0CAAAECBC4UEAAubLorEyBAgAABAcAMECBAgACBCwUEgAub7soECBAgQEAAMAMECBAgQOBCAQHgwqa7MgECBAgQEADMAAECBAgQuFBAALiw6a5MgAABAgQEADNAgAABAgQuFBAALmy6KxMgQIAAAQHADBAgQIAAgQsFBIALm+7KBAgQIEBAADADBAgQIEDgQgEB4MKmuzIBAgQIEBAAzAABAgQIELhQQAC4sOmuTIAAAQIEBAAzQIAAAQIELhQQAC5suisTIECAAAEBwAwQIECAAIELBQSAC5vuygQIECBAQAAwAwQIECBA4EIBAeDCprsyAQIECBAQAMwAAQIECBC4UEAAuLDprkyAAAECBAQAM0CAAAECBC4UEAAubLorEyBAgAABAcAMECBAgACBCwUEgAub7soECBAgQEAAMAMECBAgQOBCAQHgwqa7MgECBAgQEADMAAECBAgQuFBA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";
DaktiloJS.defaultCarriageReturnSound = "data:audio/wav;base64,UklGRjQAAABXQVZFZm10IBAAAAABAAEAESsAAAB3AgAEABAAZGF0YQAAAD///w==";


DaktiloJS.init('.daktilojs', {
    // sentences: ['Hello, DaktiloJS!', 'We are NovelSoftware', 'Deneme deneme'],
    queue: [
        'Selamlar Can Bey!',
        { type: 'pause', duration: 1000 },
        { type: 'delete', chars: 8 },
        { type: 'pause', duration: 500 },
        'Seden Hanım!',
        { type: 'pause', duration: 2000 },
        { type: 'deleteAll' },
        'Bu bizim kütüphanemiz DaktiloJs...',
        { type: 'pause', duration: 2000 },

        { type: 'deleteAll' },


    ],
    sentences: ['Hello, DaktiloJS!', 'We are NovelSoftware', 'Deneme deneme'],

    typeSpeed: 100,
    deleteSpeed: 30,
    pauseBetween: 1000,
    loop: true,
    sound: true,
    adaptiveSound: true,
    maxSoundDistance: 1500,
    soundLevel: 0.5,
    showCursor: true,
    cursorChar: '|',cursorBlinkDuration: 0.8, 
    startDelay: 1000,
    debugger: false,
    showSoundPrompt: true,
    soundPromptPosition: 'bottom-right'
});
