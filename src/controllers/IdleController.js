import extension from 'extensionizer';

const IDLE_INTERVAL = 60;
const isEdge = window.navigator.userAgent.indexOf("Edge") > -1;

export class IdleController {

    options = {};

    constructor({ options, backgroundService }) {
        this.backgroundService = backgroundService;
        this.setOptions(options);
        this.start();
    }

    setOptions(options) {
        this.options = options;
    }

    start() {

    }

    _idleMode() {
        if (this.options.type !== 'idle') {

        }

        extension.idle.setDetectionInterval(IDLE_INTERVAL);

        if (!isEdge) {
            extension.idle.onStateChanged.addListener(this._lock);
        } else {
            setInterval(() => {
                extension.idle.queryState(IDLE_INTERVAL, this._lock)
            }, 10000)
        }
    }

    _lock = (state) => {
        if (["idle", "locked"].indexOf(state) > -1) {
            this.backgroundService.walletController.lock();
        }
    }
}

