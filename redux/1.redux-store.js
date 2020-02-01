/*------count 的发布订阅者实践------*/
let state = {
  count: 1
};
let listeners = [];

/*订阅*/
function subscribe(listener) {
  listeners.push(listener);
}

function changeCount(count) {
  state.count = count;
  /*当 count 改变的时候，我们要去通知所有的订阅者*/
  for (let i = 0; i < listeners.length; i++) {
    const listener = listeners[i];
    listener();
  }
}

subscribe(() => console.log(state.count));

changeCount(2);

/* 简单封装 */

function createStore(init) {
  let state = init;
  const listeners = [];

  function subscribe(listener) {
    listeners.push(listener);
  }

  function getState() {
    return state;
  }

  function changeState(newState) {
    state = {
      ...state,
      ...newState
    };
    /*当 count 改变的时候，我们要去通知所有的订阅者*/
    listeners.forEach(listener => listener())
  }

  return {
    getState,
    subscribe,
    changeState
  }
}

const initState = {
  counter: {
    count: 0
  },
  info: {
    name: '',
    description: ''
  }
}

const store = createStore(initState);
store.subscribe(s => console.log(0, store.getState().counter));
store.subscribe(s => console.log(1, store.getState().info));
store.changeState({
  counter: {
    count: 'bar'
  }
})
store.changeState({
  info: {
    name: 'foo',
    description: 'here a foo!'
  }
})
