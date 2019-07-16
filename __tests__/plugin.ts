import Plugin from '../src/util/plugin';

describe('FILE: util/plugin', (): void => {
  const plugin = new Plugin();
  test('new Plugin(): emit test', (): void => {
    plugin.on('event', (): void => {});
    plugin.on('event', (): void => {});
    expect(plugin.emit('event')).toEqual(undefined);
  });

  test('new Plugin(): emitWithResultSet', (): void => {
    plugin.on('eventSet', (data1: any[], data2: any[]): any[] => {
      return data1.concat(data2);
    });
    plugin.on('eventSet', (): void => {});
    plugin.on('eventSet', (data1: any[], data2: any[]): any[] => {
      return [data1.length, data2.length];
    });

    expect(
      plugin.emitWithResultSet('eventSet', ['a', 'b'], ['c', 'd']),
    ).toEqual(['a', 'b', 'c', 'd', 2, 2]);
  });

  test('new Plugin(): emitWithLoop', (): void => {
    plugin.on('eventLoop', (data: number): number => {
      return data + 1;
    });
    plugin.on('eventLoop', (): void => {});
    plugin.on('eventLoop', (data: number): number => {
      return data + 2;
    });
    expect(plugin.emitWithLoop('eventLoop', 1)).toEqual(4);
  });
});
