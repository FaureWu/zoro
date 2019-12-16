import * as Z from './zoro';
import './util/pollyfill';
import Zoro from './core/zoro';
import App from './core/app';
import dispatcher from './core/dispatcher';
import Tracker from './util/tracker';

export * from './weapp/wedux';

export { dispatcher, Tracker };

export default function zoro(config: Z.Config = {}): Z.App {
  const zoro = new Zoro(config);
  return new App(zoro);
}
