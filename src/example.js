import zoro, { actions, createDispatcher, dispatcher } from './index'
import { createLoading, extendModel } from './plugin'

const delay = time => new Promise(resolve => setTimeout(resolve, time))

const app = zoro({
  onError(e) {
    console.log('onError: ', e)
  },
  onEffect(effect) {
    console.log('onEffect: ', effect)
  },
  onAction(action) {
    console.log('onAction: ', action)
  },
  async onSetup({ put, select }) {
    console.log('onSetup')
    const { timeout3 } = actions('test')
    await put(timeout3({ param: 1 }))
    console.log('end', select())
  },
})

app.use(createLoading())
app.model({
  namespace: 'test',

  state: {
    eee: 2,
  },

  async setup({ put, select }) {
    await put({ type: 'timeout' })
    await put({ type: 'test/timeout2' })
    put({ type: 'updateState' })
  },

  effects: {
    async timeout(action, { put }) {
      await delay(1000)
      put({
        type: 'save',
        payload: {
          name: 'test',
          error: false,
        },
      })
      await put({
        type: 'timeout2',
      })
    },
    async timeout2(action, { put }) {
      await delay(2000)
      put({
        type: 'save',
        payload: {
          name: 'test1',
          error: false,
        },
      })
    },
    async timeout3({ payload }, { put }) {
      console.log(payload)
      await delay(3000)
      put({
        type: 'save',
        payload: {
          name: 'test3',
          error: false,
        },
      })
    },
  },

  reducers: {
    save({ payload }) {
      return payload
    },
  },
})

app.use(extendModel({
  state: {
    extendData: 0,
  },

  reducers: {
    updateState(action, state) {
      return { ...state, extendData: 111 }
    },
  },

  excludeModels: ['eee'],
}))

const store = app.start(false)

const testDispatcher = createDispatcher('test')
testDispatcher.timeout({ data: 1 }, { meta: 1 }, false)
store.subscribe(() => console.log('subscribe state: ', store.getState()))
store
  .dispatch({ type: 'test/timeout' })
  .then(data => console.log('test/timeout callback: ', data))
  .catch(e => console.log('test/timeout onError: ', e))
dispatcher.test.timeout({ data: 2 }, { meta: 2 }, false)

app.setup()
app.model({
  namespace: 'eee',

  setup({ put }) {
    put({ type: 'add' })
  },

  state: 0,

  reducers: {
    add(action, state) {
      return state + 1
    },
  },
})
