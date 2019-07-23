import * as Redux from 'redux';
import * as Z from '../zoro';
import {
  assert,
  isReduxStore,
  isObject,
  getConnectStoreData,
  diff,
  uuid,
} from '../util/utils';
import { PLUGIN_EVENT } from '../util/constant';
import createConnectComponent from './createConnectComponent';

const scope: Z.Scope = {};

function defaultMapToProps(): object {
  return {};
}

export function setStore(store: Redux.Store, zoro?: Z.Zoro): void {
  assert(
    isReduxStore(store),
    'the store you provider not a standrand redux store',
  );

  scope.store = store;
  if (isObject(zoro)) {
    scope.zoro = zoro;
  }
}

export function connect(
  mapStateToProps?: Z.MapStateToPage,
  mapDispatchToProps?: Z.MapDispatchToPage,
): Z.CreatePageConfig {
  assert(isReduxStore(scope.store), 'connect can be call after call setStore');

  const shouldMapStateToProps: boolean = typeof mapStateToProps === 'function';
  const shouldMapDispatchToProps: boolean =
    typeof mapDispatchToProps === 'function';

  return function createConnectConfig(config: Z.PageConfig): Z.PageConfig {
    const mapState = shouldMapStateToProps
      ? mapStateToProps
      : defaultMapToProps;
    const mapDispatch = shouldMapDispatchToProps
      ? mapDispatchToProps
      : defaultMapToProps;

    let unsubscribe: Redux.Unsubscribe | undefined;
    let ready = false;
    let loadOption: object;

    function subscribe(option: object): void {
      if (typeof unsubscribe !== 'function') {
        return;
      }

      // @ts-ignore
      const mappedState: any = mapState(scope.store.getState(), option);
      // @ts-ignore
      const currentState: any = getConnectStoreData(mappedState, this.data);

      const diffData = diff(currentState, mappedState);
      if (typeof diffData === 'undefined') return;

      const connectId = uuid();
      if (
        typeof scope.zoro === 'object' &&
        scope.zoro != null &&
        !(scope.zoro instanceof Array)
      ) {
        const plugin = scope.zoro.getPlugin();
        plugin.emit(PLUGIN_EVENT.ON_WILL_CONNECT, scope.store, {
          connectId,
          // @ts-ignore
          name: this.route,
          currentData: currentState,
          nextData: mappedState,
        });
        // @ts-ignore
        this.setData(diffData, (): void => {
          plugin.emit(PLUGIN_EVENT.ON_DID_CONNECT, scope.store, {
            connectId,
            // @ts-ignore
            name: this.route,
          });
        });
      } else {
        // @ts-ignore
        this.setData(diffData);
      }
    }

    function onLoad(option: object): void {
      loadOption = option;
      if (shouldMapStateToProps) {
        // @ts-ignore
        unsubscribe = scope.store.subscribe(subscribe.bind(this, loadOption));
        // @ts-ignore
        subscribe.call(this, loadOption);
      }

      if (typeof config.onLoad === 'function') {
        // @ts-ignore
        config.onLoad.call(this, loadOption);
      }

      ready = true;
    }

    function onUnload(): void {
      if (typeof config.onUnload === 'function') {
        // @ts-ignore
        config.onUnload.call(this);
      }

      if (typeof unsubscribe === 'function') {
        unsubscribe();
        unsubscribe = undefined;
      }
    }

    function onShow(): void {
      if (ready && typeof unsubscribe !== 'function' && shouldMapStateToProps) {
        // @ts-ignore
        unsubscribe = scope.store.subscribe(subscribe.bind(this, loadOption));
        // @ts-ignore
        subscribe.call(this, loadOption);
      }

      if (typeof config.onShow === 'function') {
        // @ts-ignore
        config.onShow.call(this);
      }
    }

    function onHide(): void {
      if (typeof config.onHide === 'function') {
        // @ts-ignore
        config.onHide.call(this);
      }

      if (typeof unsubscribe === 'function') {
        unsubscribe();
        unsubscribe = undefined;
      }
    }

    return {
      ...config,
      // @ts-ignore
      ...mapDispatch(scope.store.dispatch),
      onLoad,
      onUnload,
      onShow,
      onHide,
    };
  };
}

export function connectComponent(
  mapStateToProps?: Z.MapStateToComponent,
  mapDispatchToProps?: Z.MapDispatchToComponent,
): Z.CreateComponentConfig {
  if (
    typeof scope.store === 'object' &&
    scope.store !== null &&
    !(scope.store instanceof Array)
  ) {
    return createConnectComponent(scope.store, scope.zoro)(
      mapStateToProps,
      mapDispatchToProps,
    );
  }

  throw new Error('connectComponent can be call after call setStore');
}
