import * as Redux from 'redux';
import * as Z from '../zoro';
import Zoro from './zoro';
import { defineDispatcher } from './dispatcher';
import { assert } from '../util/utils';
import { INTERCEPT_ACTION, INTERCEPT_EFFECT } from '../util/constant';

function defineIntercept(app: Z.App, zoro: Z.Zoro): void {
  app.intercept = {
    action(intercept: Z.ActionIntercept): void {
      zoro.setIntercept(INTERCEPT_ACTION, intercept);
    },
    effect(intercept: Z.EffectIntercept): void {
      zoro.setIntercept(INTERCEPT_EFFECT, intercept);
    },
  };
}

class App {
  public zoro: Z.Zoro;

  public intercept: Z.RegisterIntercepts;

  public constructor(zoro: Z.Zoro) {
    assert(zoro instanceof Zoro, 'invalid app option, we need the zoro object');
    this.zoro = zoro;
    defineDispatcher(this.zoro);
    defineIntercept(this, this.zoro);
  }

  /**
   * 改函数为内建特殊函数使用，请使用model代替
   */
  // eslint-disable-next-line
  public model__quiet(modelConfigs: Z.ModelConfig | Z.ModelConfig[]): Z.App {
    if (modelConfigs instanceof Array) {
      this.zoro.setModels(modelConfigs, false);
      return this;
    }

    this.zoro.setModel(modelConfigs, false);

    return this;
  }

  public model(modelConfigs: Z.ModelConfig | Z.ModelConfig[]): Z.App {
    if (modelConfigs instanceof Array) {
      this.zoro.setModels(modelConfigs);
      return this;
    }

    this.zoro.setModel(modelConfigs);

    return this;
  }

  public use(plugins: Z.PluginCreator | Z.PluginCreator[]): Z.App {
    if (plugins instanceof Array) {
      plugins.forEach((plugin: Z.PluginCreator): void => {
        this.zoro.usePlugin(plugin);
      });

      return this;
    }

    this.zoro.usePlugin(plugins);

    return this;
  }

  public start(setup: boolean = true): Redux.Store {
    return this.zoro.start(setup);
  }

  public setup(): void {
    this.zoro.setup();
  }
}

export default App;
