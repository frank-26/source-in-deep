/* 添加修改约束
1. 制定一个 state 修改计划，告诉 store，我的修改计划是什么。
2. 修改 store.changeState 方法，告诉它修改 state 的时候，按照我们的计划修改。
*/

/*注意：action = {type:'',other:''}, action 必须有一个 type 属性*/
function counterReducer(state, {
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

function infoReducer(state, {
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

  return {
    getState,
    subscribe,
    dispatch
  }
}

let initState = {
  counter: {
    count: 0
  },
  info: {
    name: 'foo',
    description: 'here a foo'
  }
}

const storePro = createStorePro(reducer, initState);
storePro.subscribe(s => console.log(storePro.getState()));
storePro.dispatch({
  type: 'DECREMENT'
})
storePro.dispatch({
  type: 'SET_NAME',
  name: 'bar'
})