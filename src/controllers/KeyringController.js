import ObservableStore from 'obs-store';
import log from 'loglevel';

class KeyringController {
    constructor(options = {}) {
        const initState = opts.initState || {}
        this.keyringTypes = keyringTypes
        this.store = new ObservableStore(initState)
        this.memStore = new ObservableStore({
            isUnlocked: false,
            keyringTypes: this.keyringTypes.map(krt => krt.type),
            keyrings: [],
        })

        this.encryptor = opts.encryptor || encryptor
        this.keyrings = []
        this.getNetwork = opts.getNetwork
    }
}