import zoro from './index'

const delay = time => new Promise(resolve => setTimeout(resolve, time))

const app = zoro({
  initialState: {
    loading: false,
    test: {
      eee: 1,
    },
  },
  onError(e) {
    console.log('onError: ', e)
  },
  onAffair(action) {
    console.log('onAffair: ', action)
  },
})

app.model({
  namespace: 'test',

  state: {
    eee: 2,
  },

  affairs: {
    async timeout(action, { put }) {
      await delay(2000)
      put({
        type: 'save',
        payload: {
          name: 'test',
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

const store = app.start()
store
  .dispatch({ type: 'test/timeout' })
  .then(data => console.log('then: ', data))
  .catch(e => console.log('error: ', e))
console.log('init state: ', store.getState())
store.subscribe(() => console.log('state: ', store.getState()))
