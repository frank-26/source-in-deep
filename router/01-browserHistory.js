// https://github.com/brickspert/blog/issues/3

// src/history.js

import createHistory from 'history/createBrowserHistory';

export default createHistory();

// src/index.js

import { Router, Link, Route } from 'react-router-dom';
import history from './history';

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      ...
    </Router>
  </Provider>,
  document.getElementById('root'),
);
// 其他地方我们就可以这样用了
import history from './history';

export function addProduct(props) {
  return dispatch =>
    axios.post(`xxx`, props, config)
      .then(response => {
        history.push('/cart'); //这里
      });
}