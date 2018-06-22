import createReducer from '../src/lib/createReducer'

describe('create reducer test', () => {
  test('create with none should work', (done) => {
    createReducer()
    done()
  })
})
