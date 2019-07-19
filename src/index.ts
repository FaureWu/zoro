import './util/pollyfill';
import Zoro, { Option as ZoroOption } from './core/zoro';
import App from './core/app';
import dispatcher from './core/dispatcher';

export { dispatcher };

export default function createApp(option?: ZoroOption): App {
  const zoro = new Zoro(option);
  return new App(zoro);
}
