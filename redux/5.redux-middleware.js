// 中间件是对 dispatch 的扩展，或者说重写，增强 dispatch 的功能！
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

function createStore(reducer, init,rewriteCreateStoreFunc) {
  if(rewriteCreateStoreFunc){
    const newCreateStore =  rewriteCreateStoreFunc(createStore);
    return newCreateStore(reducer, init);
 }
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

// 优化
const loggerMiddleware = (store) => (next) => (action) => {
  console.log('this state', store.getState());
  console.log('action', action);
  next(action);
  console.log('next state', store.getState());
}

const exceptionMiddleware = (store) => (next) => (action) => {
  try {
    next(action);
  } catch (err) {
    console.error('错误报告: ', err)
  }
}
const timeMiddleware = (store) => (next) => (action) => {
  console.log(new Date())
  next(action);
}

const applyMiddleware = function (...middlewares) {
  /*返回一个重写createStore的方法*/
  return function rewriteCreateStoreFunc(oldCreateStore) {
     /*返回重写后新的 createStore*/
    return function newCreateStore(reducer, initState) {
      /*1. 生成store*/
      const store = oldCreateStore(reducer, initState);
      const chain = middlewares.map(middleware => middleware(store));
      let dispatch = store.dispatch;
      /* 实现 exception(time((logger(dispatch))))*/
      chain.reverse().forEach(middleware => {
        dispatch = middleware(dispatch);
      });

      /*2. 重写 dispatch*/
      store.dispatch = dispatch;
      return store;
    }
  }
}

const rewriteCreateStoreFunc = applyMiddleware(exceptionMiddleware, timeMiddleware, loggerMiddleware);

const store = createStore(reducer, initState, rewriteCreateStoreFunc);

store.dispatch({
  type: 'INCREMENT'
});
