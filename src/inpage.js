import LocalMessageDuplexStream from 'post-message-stream';
import {setupDnode} from './lib/util';
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
            resolve(inpageApi)
        })
    });
    debugger
    global.Waves = inpageApi
}

