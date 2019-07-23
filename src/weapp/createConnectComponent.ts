import * as Redux from 'redux';
import * as Z from '../zoro';
import {
  getConnectStoreData,
  diff,
  uuid,
  assert,
  isReduxStore,
  isObject,
} from '../util/utils';
import { PLUGIN_EVENT } from '../util/constant';

function defaultMapToProps(): object {
  return {};
}

export default function createConnectComponent(
  store: Redux.Store,
  zoro?: Z.Zoro,
): Z.ConnectComponent {
  assert(
    isReduxStore(store),
    'connectComponent can be call after call setStore',
  );

  return function connectComponent(
    mapStateToProps?: Z.MapStateToComponent,
    mapDispatchToProps?: Z.MapDispatchToComponent,
  ): Z.CreateComponentConfig {
    const shouldMapStateToProps: boolean =
      typeof mapStateToProps === 'function';
    const shouldMapDispatchToProps: boolean =
      typeof mapDispatchToProps === 'function';

    return function createComponentConfig(
      config: Z.ComponentConfig,
    ): Z.ComponentConfig {
      const mapState = shouldMapStateToProps
        ? mapStateToProps
        : defaultMapToProps;
      const mapDispatch = shouldMapDispatchToProps
        ? mapDispatchToProps
        : defaultMapToProps;

      let unsubscribe: Redux.Unsubscribe | undefined;
      let ready = false;

      function subscribe(): void {
        if (typeof unsubscribe !== 'function') {
          return;
        }

        // @ts-ignore
        const mappedState: any = mapState(store.getState());
        // @ts-ignore
        const currentState: any = getConnectStoreData(mappedState, this.data);

        const diffData = diff(currentState, mappedState);
        if (typeof diffData === 'undefined') return;

        const connectId = uuid();
        if (
          typeof zoro === 'object' &&
          zoro != null &&
          !(zoro instanceof Array)
        ) {
          const plugin = zoro.getPlugin();
          plugin.emit(PLUGIN_EVENT.ON_WILL_CONNECT, store, {
            connectId,
            // @ts-ignore
            name: this.is,
            currentData: currentState,
            nextData: mappedState,
          });
          // @ts-ignore
          this.setData(diffData, (): void => {
            plugin.emit(PLUGIN_EVENT.ON_DID_CONNECT, store, {
              connectId,
              // @ts-ignore
              name: this.is,
            });
          });
        } else {
          // @ts-ignore
          this.setData(diffData);
        }
      }

      function attached(): void {
        if (shouldMapStateToProps) {
          // @ts-ignore
          unsubscribe = store.subscribe(subscribe.bind(this));
          // @ts-ignore
          subscribe.call(this);
        }

        if (
          isObject(config.lifetimes) &&
          typeof config.lifetimes.attached === 'function'
        ) {
          // @ts-ignore
          config.lifetimes.attached.call(this);
        } else if (typeof config.attached === 'function') {
          // @ts-ignore
          config.attached.call(this);
        }

        ready = true;
      }

      function detached(): void {
        if (
          isObject(config.lifetimes) &&
          typeof config.lifetimes.detached === 'function'
        ) {
          // @ts-ignore
          config.lifetimes.detached.call(this);
        } else if (typeof config.detached === 'function') {
          // @ts-ignore
          config.detached.call(this);
        }

        if (typeof unsubscribe === 'function') {
          unsubscribe();
          unsubscribe = undefined;
        }
      }

      function show(): void {
        if (
          ready &&
          typeof unsubscribe !== 'function' &&
          shouldMapStateToProps
        ) {
          // @ts-ignore
          unsubscribe = store.subscribe(subscribe.bind(this));
          // @ts-ignore
          subscribe.call(this);
        }

        if (
          isObject(config.pageLifetimes) &&
          typeof config.pageLifetimes.show === 'function'
        ) {
          // @ts-ignore
          config.pageLifetimes.show.call(this);
        }
      }

      function hide(): void {
        if (
          isObject(config.pageLifetimes) &&
          typeof config.pageLifetimes.hide === 'function'
        ) {
          // @ts-ignore
          config.pageLifetimes.hide.call(this);
        }

        if (typeof unsubscribe === 'function') {
          unsubscribe();
          unsubscribe = undefined;
        }
      }

      const componentConfig: Z.ComponentConfig = {
        ...config,
        // @ts-ignore
        methods: { ...config.methods, ...mapDispatch(store.dispatch) },
      };

      if (isObject(config.lifetimes)) {
        componentConfig.lifetimes.attached = attached;
      } else {
        componentConfig.attached = attached;
      }

      if (isObject(config.lifetimes)) {
        componentConfig.lifetimes.detached = detached;
      } else {
        componentConfig.detached = detached;
      }

      if (!isObject(config.pageLifetimes)) {
        componentConfig.pageLifetimes = {};
      }
      componentConfig.pageLifetimes.hide = hide;
      componentConfig.pageLifetimes.show = show;

      return componentConfig;
    };
  };
}
