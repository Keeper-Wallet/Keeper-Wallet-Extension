import Dnode from "dnode";
import log from "loglevel";
import pump from "pump";
import ObjectMultiplex from 'obj-multiplex';

export function setupDnode(connectionStream, api, name) {
    const mux = new ObjectMultiplex();
    pump(
        connectionStream,
        mux,
        connectionStream,
        (err) => {
            if (err) console.error(err)
        }
    );
    const apiStream = mux.createStream(name)
    const dnode = Dnode(api)
    pump(
        apiStream,
        dnode,
        apiStream,
        (err) => {
            if (err) log.error(err)
        }
    );
    return dnode
}