import Dnode from 'dnode/browser';
import pump from 'pump';
import ObjectMultiplex from 'obj-multiplex';

export function setupDnode(
  connectionStream: pump.Stream,
  api: Record<string, unknown>,
  name: string,
  additional?: string
) {
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

export function transformMethods(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformation: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  obj: Record<string, any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  target: Record<string, any> = {}
) {
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

// eslint-disable-next-line @typescript-eslint/ban-types
export function cbToPromise(fn: Function, context: unknown) {
  return (...args: unknown[]) => {
    return new Promise((resolve, reject) => {
      fn.call(context, ...args, (err: unknown, val: unknown) => {
        if (err) {
          reject(err);
        } else {
          resolve(val);
        }
      });
    });
  };
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function promiseToCb(fn: Function, context: unknown) {
  const noop = () => {
    // noop
  };

  return (...args: unknown[]) => {
    const lastArg = args[args.length - 1];
    const lastArgIsCallback = typeof lastArg === 'function';
    let callback: {
      (error: null, result: unknown): void;
      (error: unknown): void;
    };
    if (lastArgIsCallback) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      callback = lastArg as any;
      args.pop();
    } else {
      callback = noop;
    }
    fn.apply(context, args)
      .then((result: unknown) => callback(null, result))
      .catch((error: unknown) => callback(error));
  };
}
