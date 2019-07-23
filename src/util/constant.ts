import * as Z from '../zoro';

export const NAMESPACE_DIVIDER = '/';

export const PLUGIN_EVENT: Z.PLUGINEVENT = {
  INJECT_INITIAL_STATE: 'injectInitialState',
  INJECT_MODELS: 'injectModels',
  INJECT_MIDDLEWARES: 'injectMiddlewares',
  INJECT_ENHANCERS: 'injectEnhancers',
  ON_REDUCER: 'onReducer',
  ON_BEFORE_CREATE_MODEL: 'onBeforeCreateModel',
  ON_AFTER_CREATE_MODEL: 'onAfterCreateModel',
  ON_SETUP_MODEL: 'onSetupModel',
  ON_WILL_EFFECT: 'onWillEffect',
  ON_DID_EFFECT: 'onDidEffect',
  ON_WILL_ACTION: 'onWillAction',
  ON_DID_ACTION: 'onDidAction',
  ON_SETUP: 'onSetup',
  ON_SUBSCRIBE: 'onSubscribe',
  ON_ERROR: 'onError',
  ON_WILL_CONNECT: 'onWillConnect',
  ON_DID_CONNECT: 'onDidConnect',
};

export const INTERCEPT_ACTION = 'INTERCEPT_ACTION';
export const INTERCEPT_EFFECT = 'INTERCEPT_EFFECT';

export const INTERCEPT_TYPE: string[] = [INTERCEPT_ACTION, INTERCEPT_EFFECT];
