import * as Z from '../zoro';
import { PLUGIN_EVENT } from '../util/constant';
import { assert } from '../util/utils';

const dispatcher: Z.DispatcherGroup = {};
const cache = {};

function createDispatch(model: Z.Model, zoro: Z.Zoro): Z.Dispatchers {
  const namespace = model.getNamespace();

  if (typeof cache[namespace] !== 'undefined') {
    return cache[namespace];
  }

  const modelActionCreators = model.getActionCreators();
  cache[namespace] = Object.keys(modelActionCreators).reduce(
    (combine: Z.Dispatchers, type: string): Z.Dispatchers => {
      combine[type] = function dispatch(
        payload?: any,
        meta?: any,
        error?: boolean,
      ): Z.Action {
        const store = zoro.getStore();
        return store.dispatch(modelActionCreators[type](payload, meta, error));
      };

      return combine;
    },
    {},
  );

  return cache[namespace];
}

export function defineDispatcher(zoro: Z.Zoro): void {
  zoro
    .getPlugin()
    .on(PLUGIN_EVENT.ON_AFTER_CREATE_MODEL, function fn(model: Z.Model): void {
      const namespace = model.getNamespace();

      Object.defineProperty(dispatcher, namespace, {
        get(): Z.Dispatchers {
          return createDispatch(model, zoro);
        },
        set(): any {
          assert(false, 'cannot set the dispatcher');
        },
      });
    });
}

export default dispatcher;
