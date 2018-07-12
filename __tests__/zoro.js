import zoro from '../src'

describe('zoro option test', () => {
  test('initialState test', () => {
    const app = zoro({
      initialState: {
        test: 1,
      },
    })
    app.model({
      namespace: 'test',
    })
    const store = app.start()
    expect(store.getState()).toEqual({ test: 1 })
  })

  test('model state replace initialState test', () => {
    const app = zoro({
      initialState: {
        test: 1,
      },
    })
    app.model({
      namespace: 'test',
      state: 'test',
    })
    const store = app.start()
    expect(store.getState()).toEqual({ test: 'test' })
  })

  test('onSetup test', () => {
    const app = zoro({
      onSetup({ put, select }) {
        const state = select(state => state.test)
        put({ type: 'test/save', payload: state + 1 })
      },
    })
    app.model({
      namespace: 'test',
      state: 0,
      reducers: {
        save(action, state) {
          return action.payload
        },
      },
    })
    const store = app.start()
    expect(store.getState()).toEqual({ test: 1 })
  })

  test('onAction test', done => {
    const app = zoro({
      onAction(action) {
        done()
      },
    })
    app.model({
      namespace: 'test',
      state: 0,
      reducers: {
        save(action, state) {
          return action.payload
        },
      },
    })
    const store = app.start()
    store.dispatch({ type: 'test/save', payload: 2 })
  })
})
