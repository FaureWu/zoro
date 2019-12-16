import Tracker from '../src/util/tracker';

const tracker = new Tracker();

function delay(time: number): Promise<void> {
  // eslint-disable-next-line
  return new Promise((resolve): NodeJS.Timeout => setTimeout(resolve, time));
}

async function asyncFunc1(): Promise<void> {
  await delay(1000);
  tracker.set('READY');
}

async function asyncFunc2(): Promise<boolean> {
  await tracker.wait('READY');
  return tracker.get('READY');
}

describe('Tracker Test', (): void => {
  test('tracker success test', async (): Promise<void> => {
    asyncFunc1();
    const result = await asyncFunc2();
    expect(result).toEqual(true);
  });
});
