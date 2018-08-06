const getFirstLangCode = require('./lib/get-first-lang-code');
const LocalStorageStore = require('obs-store/lib/localStorage');
const LocalStore = require('./lib/local-store');

const STORAGE_KEY = 'waveskeeper-config';
const METAMASK_DEBUG = process.env.WAVESKEEPER_DEBUG;

// state persistence
const diskStore = new LocalStorageStore({ storageKey: STORAGE_KEY });
const localStore = new LocalStore();

backgroundInit().catch(e => console.error(e));


async function backgroundInit(){
    const initState = await loadInitState();
    const langCode = await getFirstLangCode();
    const backgroundService = new BackgroundService(initState, langCode)
}


async function loadInitState(){
      const state = (await localStore.get()) || diskStore.getState() ;
      return state
}


class BackgroundService {
    constructor(initState, langCode){
        debugger
    }


}