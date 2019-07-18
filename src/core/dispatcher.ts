import { AnyAction, Store } from 'redux';
import Zoro from './zoro';
import Model from './model';
import { PLUGIN_EVENT } from '../util/constant';
import { assert } from '../util/utils';

export type CustomDispatch = (
  payload?: any,
  meta?: any,
  error?: boolean,
) => AnyAction;

export interface CustomDispatchs {
  [type: string]: CustomDispatch;
}

let dispatcher = {};
const cache = {};

function createDispatch(model: Model, zoro: Zoro): CustomDispatchs {
  const namespace = model.getNamespace();

  if (typeof cache[namespace] !== 'undefined') {
    return cache[namespace];
  }

  const modelActionCreators = model.getActionCreators();
  cache[namespace] = Object.keys(modelActionCreators).reduce(
    (combine: CustomDispatchs, type: string): CustomDispatchs => {
      combine[type] = function dispatch(
        payload?: any,
        meta?: any,
        error?: boolean,
      ): AnyAction {
        const store: Store = zoro.getStore();
        return store.dispatch(modelActionCreators[type](payload, meta, error));
      };

      return combine;
    },
    {},
  );

  return cache[namespace];
}

export function defineDispatcher(zoro: Zoro): void {
  if (typeof Proxy === 'function') {
    dispatcher = new Proxy(
      {},
      {
        get(target: any, namespace: string): CustomDispatchs {
          const model: Model = zoro.getModel(namespace);
          return createDispatch(model, zoro);
        },
        set(): any {
          assert(false, 'cannot set the dispatcher');
        },
      },
    );
  } else {
    zoro
      .getPlugin()
      .on(PLUGIN_EVENT.ON_CREATE_MODEL, function fn(model: Model): void {
        const namespace = model.getNamespace();

        Object.defineProperty(dispatcher, namespace, {
          get(): CustomDispatchs {
            return createDispatch(model, zoro);
          },
          set(): any {
            assert(false, 'cannot set the dispatcher');
          },
        });
      });
  }
}

export default dispatcher;
