/* 添加修改约束
1. 制定一个 state 修改计划，告诉 store，我的修改计划是什么。
2. 修改 store.changeState 方法，告诉它修改 state 的时候，按照我们的计划修改。
*/

/*注意：action = {type:'',other:''}, action 必须有一个 type 属性*/
function reducer(state, action) {
  switch (action.type) {
    case 'INCREMENT':
      return {
        ...state,
        count: state.count + 1
      }
      case 'DECREMENT':
        return {
          ...state,
          count: state.count - 1
        }
        default:
          return state;
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

const storePro = createStorePro(reducer, {
  count: 0
});
storePro.subscribe(s => console.log(storePro.getState().count));
storePro.dispatch({
  type: 'DECREMENT'
})
storePro.dispatch({
  type: 'x'
})