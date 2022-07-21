import Dnode from 'dnode/browser';
import pump from 'pump';
import ObjectMultiplex from 'obj-multiplex';

export function setupDnode(connectionStream, api, name, additional) {
  const mux = new ObjectMultiplex();
  pump(connectionStream, mux, connectionStream);

  const apiStream = mux.createStream(name);
  const dnode = Dnode(transformMethods(promiseToCb, api));

  if (additional) {
    mux.createStream(additional);
  }

  pump(apiStream, dnode, apiStream);

  return dnode;
}

export function transformMethods(transformation, obj, target = {}) {
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === 'object') {
      target[key] = {};
      transformMethods(transformation, obj[key], target[key]);
    } else if (typeof obj[key] === 'function') {
      target[key] = transformation(obj[key], obj);
    } else {
      target[key] = obj[key];
    }
  });
  return target;
}

export function cbToPromise(fn, context) {
  return (...args) => {
    return new Promise((resolve, reject) => {
      fn.call(context, ...args, (err, val) => {
        if (err) {
          reject(err);
        } else {
          resolve(val);
        }
      });
    });
  };
}

export function promiseToCb(fn, context) {
  const noop = () => {
    // noop
  };

  return (...args) => {
    const lastArg = args[args.length - 1];
    const lastArgIsCallback = typeof lastArg === 'function';
    let callback;
    if (lastArgIsCallback) {
      callback = lastArg;
      args.pop();
    } else {
      callback = noop;
    }
    fn.apply(context, args)
      .then(result => setTimeout(callback, 0, null, result))
      .catch(error => setTimeout(callback, 0, error));
  };
}
