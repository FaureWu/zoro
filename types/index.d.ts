import './util/pollyfill';
import { Option as ZoroOption } from './core/zoro';
import App from './core/app';
import dispatcher from './core/dispatcher';
export { dispatcher };
export default function createApp(option?: ZoroOption): App;
