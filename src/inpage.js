import LocalMessageDuplexStream from 'post-message-stream';
import {setupDnode, transformMethods, cbToPromise} from './lib/dnode-util';
import log from "loglevel";
import EventEmitter from 'events';

setupClickInterceptor();
setupInpageApi().catch(e => log.error(e));

async function setupInpageApi() {
    const connectionStream = new LocalMessageDuplexStream({
        name: 'page',
        target: 'content',
    });


    const eventEmitter = new EventEmitter();
    const emitterApi = {
        sendUpdate: async state => eventEmitter.emit('update', state)
    };
    const dnode = setupDnode(connectionStream, emitterApi, 'inpageApi');

    const inpageApi = await new Promise(resolve => {
        dnode.once('remote', inpageApi => {
            let remoteWithPromises = transformMethods(cbToPromise, inpageApi);
            // Add event emitter api to background object
            remoteWithPromises.on = eventEmitter.on.bind(eventEmitter);
            resolve(remoteWithPromises)
        })
    });

    global.Waves = inpageApi
}

function setupClickInterceptor(){
    const defaultOnClick = global.onclick || (() => {})
    global.onclick = function(e) {
        const paymentApiLink = checkForPaymentApiLink(e)
        if (paymentApiLink) {
            e.preventDefault();
            e.stopPropagation();
            console.log(e)
        }else {
            defaultOnClick(e)
        }
    }
}


function checkForPaymentApiLink(e) {
    return undefined
}