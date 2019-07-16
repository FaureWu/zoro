import { assert } from './utils';

export type EventHandler = (...params: any[]) => any;

export interface EventHandlers {
  [eventName: string]: EventHandler[];
}

class Plugin {
  private eventHandlers: EventHandlers = {};

  public on(eventName: string, eventHandler: EventHandler): void {
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
      eventHandlers.forEach((eventHandler: EventHandler): void => {
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
        (result: any[], eventHandler: EventHandler): any[] => {
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

  public emitWithLoop(eventName: string, data: any): any {
    assert(
      typeof eventName === 'string',
      `the plugin event's name is necessary, but we get ${eventName}`,
    );

    const eventHandlers = this.eventHandlers[eventName];
    if (eventHandlers instanceof Array) {
      return eventHandlers.reduce(
        (result: any, eventHandler: EventHandler): any => {
          const prev = typeof result !== 'undefined' ? result : data;
          const next = eventHandler(prev);
          return typeof next !== 'undefined' ? next : prev;
        },
        undefined,
      );
    }

    return undefined;
  }
}

export default Plugin;
