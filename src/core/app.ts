import { Store } from 'redux';
import Zoro, { PluginCreator, ActionIntercept, EffectIntercept } from './zoro';
import { Option as ModelOption } from './model';
import { GlobalState } from './store';
import { defineDispatcher } from './dispatcher';
import { assert } from '../util/utils';
import { INTERCEPT_ACTION, INTERCEPT_EFFECT } from '../util/constant';

export interface Intercept {
  action: (intercept: ActionIntercept) => void;
  effect: (intercept: EffectIntercept) => void;
}

function defineIntercept(app: App, zoro: Zoro): void {
  app.intercept = {
    action(intercept: ActionIntercept): void {
      zoro.setIntercept(INTERCEPT_ACTION, intercept);
    },
    effect(intercept: EffectIntercept): void {
      zoro.setIntercept(INTERCEPT_EFFECT, intercept);
    },
  };
}

class App {
  private zoro: Zoro;

  public intercept: Intercept;

  public constructor(zoro: Zoro) {
    assert(zoro instanceof Zoro, 'invalid app option, we need the zoro object');
    this.zoro = zoro;
    defineDispatcher(this.zoro);
    defineIntercept(this, this.zoro);
  }

  public model(modelOptions: ModelOption | ModelOption[]): App {
    if (modelOptions instanceof Array) {
      this.zoro.setModels(modelOptions);
      return this;
    }

    this.zoro.setModel(modelOptions);

    return this;
  }

  public use(plugins: PluginCreator | PluginCreator[]): App {
    if (plugins instanceof Array) {
      plugins.forEach((plugin: PluginCreator): void => {
        this.zoro.usePlugin(plugin);
      });

      return this;
    }

    this.zoro.usePlugin(plugins);

    return this;
  }

  public start(setup: boolean = true): Store<GlobalState> {
    return this.zoro.start(setup);
  }

  public setup(): void {
    this.zoro.setup();
  }
}

export default App;
