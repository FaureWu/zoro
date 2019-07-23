import * as Z from '../type';
import { assert } from './utils';

class Plugin {
  private eventHandlers: Z.PluginEvents = {};

  public on(eventName: string, eventHandler: Z.PluginEvent): void {
    assert(
      typeof eventName === 'string',
      `the plugin event's name is necessary, but we get ${eventName}`,
    );

    const eventHandlers = this.eventHandlers[eventName];
    if (!(eventHandlers instanceof Array)) {
      this.eventHandlers[eventName] = [];
    }

    this.eventHandlers[eventName].push(eventHandler);
  }

  public emit(eventName: string, ...params: any[]): void {
    assert(
      typeof eventName === 'string',
      `the plugin event's name is necessary, but we get ${eventName}`,
    );

    const eventHandlers = this.eventHandlers[eventName];
    if (eventHandlers instanceof Array) {
      eventHandlers.forEach((eventHandler: Z.PluginEvent): void => {
        eventHandler(...params);
      });
    }
  }

  public emitWithResultSet(eventName: string, ...params: any[]): any[] {
    assert(
      typeof eventName === 'string',
      `the plugin event's name is necessary, but we get ${eventName}`,
    );

    const eventHandlers = this.eventHandlers[eventName];
    if (eventHandlers instanceof Array) {
      return eventHandlers.reduce(
        (result: any[], eventHandler: Z.PluginEvent): any[] => {
          const returnData = eventHandler(...params);
          if (returnData instanceof Array) {
            return result.concat(returnData);
          }

          return result;
        },
        [],
      );
    }

    return [];
  }

  public emitWithLoop(eventName: string, data: any, ...params: any[]): any {
    assert(
      typeof eventName === 'string',
      `the plugin event's name is necessary, but we get ${eventName}`,
    );

    const eventHandlers = this.eventHandlers[eventName];
    if (eventHandlers instanceof Array) {
      return eventHandlers.reduce(
        (result: any, eventHandler: Z.PluginEvent): any => {
          const prev = typeof result !== 'undefined' ? result : data;
          const next = eventHandler(prev, ...params);
          return typeof next !== 'undefined' ? next : prev;
        },
        undefined,
      );
    }

    return undefined;
  }

  public has(eventName: string): boolean {
    const eventHandlers = this.eventHandlers[eventName];
    return eventHandlers instanceof Array && eventHandlers.length > 0;
  }
}

export default Plugin;
