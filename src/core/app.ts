import { Store } from 'redux';
import Zoro, { PluginCreator, Intercept } from './zoro';
import { Option as ModelOption } from './model';
import { defineDispatcher } from './dispatcher';
import { assert } from '../util/utils';
import { INTERCEPT_ACTION, INTERCEPT_EFFECT } from '../util/constant';

export interface ZoroIntercept {
  action: (intercept: Intercept) => void;
  effect: (intercept: Intercept) => void;
}

function defineIntercept(app: App, zoro: Zoro): void {
  app.intercept = {
    action(intercept: Intercept): void {
      zoro.setIntercept(INTERCEPT_ACTION, intercept);
    },
    effect(intercept: Intercept): void {
      zoro.setIntercept(INTERCEPT_EFFECT, intercept);
    },
  };
}

class App {
  private zoro: Zoro;

  public intercept?: ZoroIntercept;

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

  public start(setup: boolean): Store {
    return this.zoro.start(setup);
  }

  public setup(): void {
    this.zoro.setup();
  }
}

export default App;
