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
 if (typeof initState === 'function'){
  rewriteCreateStoreFunc = initState;
  initState = undefined;
}
  let state = init;
  const listeners = [];

  function subscribe(listener) {
    listeners.push(listener);
    return function unsubscribe() {
      const index = listeners.indexOf(listener)
      listeners.splice(index, 1)
    }
  }

  function getState() {
    return state;
  }

  function dispatch(action) {
    state = reducer(state, action);
    listeners.forEach(listener => listener())
  }

  function replaceReducer(nextReducer) {
    reducer = nextReducer
    /*刷新一遍 state 的值，新来的 reducer 把自己的默认状态放到 state 树上去*/
    init()
  }

  // 初始化
  function init(){
    dispatch({
      type: Symbol()
    })
  }

  init()


  return {
    getState,
    subscribe,
    dispatch,
    replaceReducer
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

const unsubscribe = store.subscribe(() => {
  let state = store.getState();
  console.log(state.counter.count);
});
/*退订*/
// unsubscribe();
store.dispatch({
  type: 'INCREMENT'
});

/*返回 action 的函数就叫 actionCreator*/
function increment() {
  return {
    type: 'INCREMENT'
  }
}

function setName(name) {
  return {
    type: 'SET_NAME',
    name: name
  }
}

const actions = {
  increment: function () {
    return store.dispatch(increment.apply(this, arguments))
  },
  setName: function () {
    return store.dispatch(setName.apply(this, arguments))
  }
}
/*注意：我们可以把 actions 传到任何地方去*/
/*其他地方在实现自增的时候，根本不知道 dispatch，actionCreator等细节*/
actions.increment(); /*自增*/
actions.setName('baz'); /*修改 info.name*/

/*核心的代码在这里，通过闭包隐藏了 actionCreator 和 dispatch*/
function bindActionCreator(actionCreator, dispatch) {
  return function () {
    return dispatch(actionCreator.apply(this, arguments))
  }
}

/* actionCreators 必须是 function 或者 object */
function bindActionCreators(actionCreators, dispatch) {
  if (typeof actionCreators === 'function') {
    return bindActionCreator(actionCreators, dispatch)
  }

  if (typeof actionCreators !== 'object' || actionCreators === null) {
    throw new Error()
  }

  const keys = Object.keys(actionCreators)
  const boundActionCreators = {}
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const actionCreator = actionCreators[key]
    if (typeof actionCreator === 'function') {
      boundActionCreators[key] = bindActionCreator(actionCreator, dispatch)
    }
  }
  return boundActionCreators
}

const newActions = bindActionCreators({ increment, setName }, store.dispatch);
newActions.increment()