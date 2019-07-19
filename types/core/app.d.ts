import { Store } from 'redux';
import Zoro, { PluginCreator, ActionIntercept, EffectIntercept } from './zoro';
import { Option as ModelOption } from './model';
import { GlobalState } from './store';
export interface Intercept {
  action: (intercept: ActionIntercept) => void;
  effect: (intercept: EffectIntercept) => void;
}
declare class App {
  private zoro;
  intercept: Intercept;
  constructor(zoro: Zoro);
  model(modelOptions: ModelOption | ModelOption[]): App;
  use(plugins: PluginCreator | PluginCreator[]): App;
  start(setup?: boolean): Store<GlobalState>;
  setup(): void;
}
export default App;
