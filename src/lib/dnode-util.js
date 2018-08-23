import Dnode from "dnode/browser";
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
    const apiStream = mux.createStream(name);
    const dnode = Dnode(transformMethods(promiseToCb, api));
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


export function transformMethods(transformation, obj, target = {}) {
    Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'object') {
            target[key] = {}
            transformMethods(transformation, obj[key], target[key])
        } else if (typeof obj[key] === 'function') {
            target[key] = transformation(obj[key], obj)
        } else {
            target[key] = obj[key]
        }
    });
    return target
}


export function cbToPromise(fn, context) {
    return (...args) => {
        return new Promise((resolve, reject) => {
            fn.call(context, ...args, (err, val) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(val)
                }
            })
        })
    }
}

export function promiseToCb(fn, context) {
    return (...args) => {

        const lastArg = args[args.length - 1];
        const lastArgIsCallback = typeof lastArg === 'function';
        let callback;
        if (lastArgIsCallback) {
            callback = lastArg;
            args.pop()
        } else {
            callback = () => {};
        }
        fn.apply(context, args)
            .then(result => setImmediate(callback, null, result))
            .catch(error => setImmediate(callback, error))
    }
}
