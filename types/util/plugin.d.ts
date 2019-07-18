export declare type EventHandler = (...params: any[]) => any;
export interface EventHandlers {
  [eventName: string]: EventHandler[];
}
declare class Plugin {
  private eventHandlers;
  on(eventName: string, eventHandler: EventHandler): void;
  emit(eventName: string, ...params: any[]): void;
  emitWithResultSet(eventName: string, ...params: any[]): any[];
  emitWithLoop(eventName: string, data: any, ...params: any[]): any;
  has(eventName: string): boolean;
}
export default Plugin;
