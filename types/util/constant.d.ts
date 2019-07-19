export declare const NAMESPACE_DIVIDER = '/';
export interface PluginEvent {
  INJECT_INITIAL_STATE: string;
  INJECT_MODELS: string;
  INJECT_MIDDLEWARES: string;
  INJECT_ENHANCERS: string;
  ON_REDUCER: string;
  ON_BEFORE_CREATE_MODEL: string;
  ON_AFTER_CREATE_MODEL: string;
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
export declare const PLUGIN_EVENT: PluginEvent;
export declare const INTERCEPT_ACTION = 'INTERCEPT_ACTION';
export declare const INTERCEPT_EFFECT = 'INTERCEPT_EFFECT';
export declare const INTERCEPT_TYPE: string[];
