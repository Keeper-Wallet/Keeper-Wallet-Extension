import LocalMessageDuplexStream from 'post-message-stream';
import {setupDnode, transformMethods, cbToPromise} from './lib/dnode-util';
import log from "loglevel";

setupInpageApi().catch(e => log.error(e));

async function setupInpageApi() {
    const connectionStream = new LocalMessageDuplexStream({
        name: 'page',
        target: 'content',
    });


    const dnode = setupDnode(connectionStream, {}, 'inpageApi');
    const inpageApi = await new Promise(resolve => {
        dnode.once('remote', inpageApi => {
            resolve(transformMethods(cbToPromise,inpageApi))
        })
    });

    global.Waves = inpageApi
}

