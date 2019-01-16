import LocalMessageDuplexStream from 'post-message-stream';
import { setupDnode, transformMethods, cbToPromise } from './lib/dnode-util';
import log from "loglevel";
import EventEmitter from 'events';

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

    global.WavesKeeper = global.Waves = inpageApi;
    setupClickInterceptor(inpageApi);
}

function setupClickInterceptor(inpageApi){
    document.addEventListener("click", (e)=> {
        const paymentApiResult = checkForPaymentApiLink(e);
        try {
            if (paymentApiResult && processPaymentAPILink(paymentApiResult, inpageApi)) {
                e.preventDefault();
                e.stopPropagation();
            }
        } catch (e) {
            
        }
    })
}


function checkForPaymentApiLink(e) {
    let node = e.target;

    const check = (node) => {
        const href = node.href;
        
        if (!node.href) {
            return false;
        }

        const url = new URL(href);

        if (url.host !== 'client.wavesplatform.com') {
            return false;
        }

        if (!url.hash.indexOf('#gateway/auth')) {
            return {
                type: 'auth',
                hash: url.hash
            }
        }

        if (!url.hash.indexOf('#send/') && url.hash.includes('strict=true')) {
            return {
                type: 'send',
                hash: url.hash
            }
        }

        return false
    };

    while (node) {
        const result = check(node);
        if (result) {
            return result;
        }
        node = node.parentElement;
    }

    return false
}

function processPaymentAPILink({ type, hash }, inpageApi) {
    const apiData = hash.split('?')[1].split('&').reduce( (obj, data) => {
        const item = data.split('=');
        obj[item[0]] = decodeURIComponent(item[1].trim());
        return obj;
    }, { type });

    switch (apiData.type) {
        case 'auth':
            if (!apiData.n || !apiData.d || !apiData.r || apiData.r.indexOf('https') !== 0) {
                return false;
            }

            inpageApi.auth({
                name: apiData.n,
                data: apiData.d,
                icon: apiData.i ? new URL(apiData.i, apiData.r).href : '',
                referrer: apiData.r,
                successPath: new URL(apiData.s || '', apiData.r).href,
            });
            break;
        case 'send':
            const assetId = hash.split('?')[0].replace('#send/', '');

            if (!assetId || !apiData.amount) {
                return false;
            }

            inpageApi.signAndPublishTransaction({
                type: 4,
                successPath: apiData.referrer,
                data: {
                    amount: {
                        assetId: assetId,
                        tokens: apiData.amount
                    },
                    fee: {
                        assetId: 'WAVES',
                        tokens: '0.00100000'
                    },
                    recipient: apiData.recipient,
                    attachment: apiData.attachment || ''
                }
            });
            break;
    }

    return true;
}

