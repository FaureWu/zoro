import { Store } from 'redux';
import Zoro, { PluginCreator, Intercept } from './zoro';
import { Option as ModelOption } from './model';
export interface ZoroIntercept {
  action: (intercept: Intercept) => void;
  effect: (intercept: Intercept) => void;
}
declare class App {
  private zoro;
  intercept?: ZoroIntercept;
  constructor(zoro: Zoro);
  model(modelOptions: ModelOption | ModelOption[]): App;
  use(plugins: PluginCreator | PluginCreator[]): App;
  start(setup: boolean): Store;
  setup(): void;
}
export default App;
