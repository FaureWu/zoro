export const NAMESPACE_DIVIDER = '/';

export interface PluginEvent {
  INJECT_INITIAL_STATE: string;
  INJECT_MODELS: string;
  INJECT_MIDDLEWARES: string;
  INJECT_ENHANCERS: string;
  ON_REDUCER: string;
  ON_CREATE_MODEL: string;
  ON_SETUP_MODEL: string;
  ON_WILL_EFFECT: string;
  ON_DID_EFFECT: string;
  ON_WILL_ACTION: string;
  ON_DID_ACTION: string;
  ON_SETUP: string;
  ON_SUBSCRIBE: string;
  ON_ERROR: string;
  ON_WILL_CONNECT: string;
  ON_DID_CONNECT: string;
}

export const PLUGIN_EVENT: PluginEvent = {
  INJECT_INITIAL_STATE: 'injectInitialState',
  INJECT_MODELS: 'injectModels',
  INJECT_MIDDLEWARES: 'injectMiddlewares',
  INJECT_ENHANCERS: 'injectEnhancers',
  ON_REDUCER: 'onReducer',
  ON_CREATE_MODEL: 'onCreateModel',
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

export const INTERCEPT_TYPE = [INTERCEPT_ACTION, INTERCEPT_EFFECT];
