import * as Z from './type';
import './util/pollyfill';
import Zoro from './core/zoro';
import App from './core/app';
import dispatcher from './core/dispatcher';

export { dispatcher };

export default function zoro(config: Z.Config = {}): Z.App {
  const zoro: Z.Zoro = new Zoro(config);
  return new App(zoro);
}
