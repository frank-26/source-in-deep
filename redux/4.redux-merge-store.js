const initState = {
  count: 0
}

function counterReducer(state = initState, {
  type
}) {
  let count = state.count;
  switch (type) {
    case 'INCREMENT':
      count = count + 1;
      break;
    case 'DECREMENT':
      count = count - 1;
      break;
    default:
      break;
  }
  return {
    ...state,
    count
  }
}

const initStateInfo = {
  info: {
    name: 'foo',
    description: 'foolish'
  }
}

function infoReducer(state = initStateInfo, {
  type,
  name,
  description
}) {
  const result = {}
  switch (type) {
    case 'SET_NAME':
      result.name = name;
      break;
    case 'SET_DESCRIPTION':
      result.description = description;
      break;
    default:
      break;
  }
  return {
    ...state,
    ...result
  }
}

const reducer = combineReducers({
  counter: counterReducer,
  info: infoReducer
});

// 输入各 reducer，针对各 reducer 分别让其执行，返回一个 reducer 函数
function combineReducers(reducers) {
  return (state = {}, action) => {

    return Object.entries(reducers).reduce((nextState, [reducerKey, reduceValue]) => {
      nextState[reducerKey] = reduceValue(state[reducerKey], action);
      return nextState
    }, {})
  }
}

function createStorePro(reducer, init) {
  let state = init;
  const listeners = [];

  function subscribe(listener) {
    listeners.push(listener);
  }

  function getState() {
    return state;
  }

  function dispatch(action) {
    state = reducer(state, action);
    listeners.forEach(listener => listener())
  }
  // 初始化
  dispatch({
    type: Symbol()
  })

  return {
    getState,
    subscribe,
    dispatch
  }
}

const storePro = createStorePro(reducer);

console.log(storePro.getState())
// storePro.subscribe(s => console.log(storePro.getState()));
// storePro.dispatch({
//   type: 'DECREMENT'
// })
// storePro.dispatch({
//   type: 'SET_NAME',
//   name: 'bar'
// })