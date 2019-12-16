import * as Z from '../zoro';

class Tracker {
  private status: Z.TrackerStatus = {};

  private events: Z.TrackerEvents = {};

  private on(name: string, resolve: () => void, reject: () => void): void {
    let events = this.events[name];

    if (!(events instanceof Array)) {
      events = [];
    }
    events.push({ resolve, reject });
    this.events[name] = events;
  }

  private trigger(name: string): void {
    const callbacks = this.events[name];

    if (callbacks instanceof Array) {
      callbacks.forEach(({ resolve }): void => {
        if (typeof resolve !== 'function') return;
        resolve();
      });

      delete this.events[name];
    }
  }

  private reject(name: string): void {
    const callbacks = this.events[name];

    if (callbacks instanceof Array) {
      callbacks.forEach(({ reject }): void => {
        if (typeof reject !== 'function') return;
        reject();
      });

      delete this.events[name];
    }
  }

  private rejectAll(): void {
    Object.keys(this.events).forEach((name: string): void => this.reject(name));
  }

  public get(name: string): boolean {
    return !!this.status[name];
  }

  public set(name: string): void {
    this.status[name] = true;
    this.trigger(name);
  }

  public unset(name?: string): void {
    if (typeof name === 'string') {
      delete this.status[name];
      this.reject(name);
      return;
    }

    this.status = {};
    this.rejectAll();
  }

  public wait(name: string): Promise<void> {
    if (this.get(name)) Promise.resolve();

    return new Promise((resolve, reject): void => {
      this.on(name, resolve, reject);
    });
  }
}

export default Tracker;
