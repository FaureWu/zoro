import * as Z from './zoro';
import './util/pollyfill';
import Zoro from './core/zoro';
import { assert, isObject } from './util/utils';
import App from './core/app';
import dispatcher from './core/dispatcher';
import createConnectComponent from './weapp/createConnectComponent';
import Tracker from './util/tracker';

const scope: Z.Scope = {};

export { dispatcher, Tracker };

export function connectComponent(
  mapStateToProps?: Z.MapStateToComponent,
  mapDispatchToProps?: Z.MapDispatchToComponent,
): Z.CreateComponentConfig {
  assert(
    isObject(scope.zoro),
    'connectComponent can be call after call app.start()',
  );

  // @ts-ignore
  const store: Redux.Store = scope.zoro.getStore();

  return createConnectComponent(store, scope.zoro)(
    mapStateToProps,
    mapDispatchToProps,
  );
}

export default function zoro(config: Z.Config = {}): Z.App {
  scope.zoro = new Zoro(config);
  return new App(scope.zoro);
}
