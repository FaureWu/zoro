import createReducer from '../src/lib/createReducer'

describe('create reducer test', () => {
  test('create with none should work', done => {
    createReducer()
    done()
  })

  test('create with incorrect handlers should throw error', () => {
    expect(() => {
      createReducer(undefined, () => {})
      createReducer(undefined, [])
      createReducer(undefined, null)
      createReducer(undefined, '')
      createReducer(undefined, 1)
      createReducer(undefined, NaN)
    }).toThrow()
  })

  test('do the reducer should word', () => {
    const actionType = 'test'
    const action = { type: actionType }
    expect(
      createReducer(undefined, {
        [actionType]: (action, state) => state,
      })(undefined, action),
    ).toEqual(undefined)
    expect(
      createReducer(
        { test: 1 },
        {
          [actionType]: (action, state) => state,
        },
      )(undefined, action),
    ).toEqual({ test: 1 })
    expect(
      createReducer(undefined, {
        [actionType]: (action, state) => state,
      })({ test: 1 }, action),
    ).toEqual({ test: 1 })
  })

  test('do the reducer with incorrect handlers should throw error', () => {
    const actionType = 'test'
    const action = { type: actionType }
    expect(() => {
      createReducer(undefined, { [actionType]: 1 })(undefined, action)
      createReducer(undefined, { [actionType]: undefined })(undefined, action)
      createReducer(undefined, { [actionType]: '' })(undefined, action)
      createReducer(undefined, { [actionType]: null })(undefined, action)
      createReducer(undefined, { [actionType]: NaN })(undefined, action)
      createReducer(undefined, { [actionType]: [] })(undefined, action)
      createReducer(undefined, { [actionType]: {} })(undefined, action)
    }).toThrow()
  })
})
