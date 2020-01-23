import React, { Component, useState, memo } from 'react';

import Header from './Header';

const CountRenderer =
// memo(
  ({ count, children }) =>
  <div>Count Renderer ({children}): { count }</div>
  // )

const RenderTest = () => {
  const [count, setCount] = useState(0);
  const [other, setOther] = useState(100);

  return (
    <div>
      <div>count: { count }</div>
      <CountRenderer count={count}>
        'count'
      </CountRenderer>
      <CountRenderer count={other}>
        'other'
      </CountRenderer>
      <button onClick={() => setCount(count + 1)}>increment count</button>
      <button onClick={() => setOther(other + 1)}>increment other</button>
    </div>
  );
};

class App extends Component {
  render() {
    return (
      <div className='app'>
        <Header />
        {this.props.children}
        <RenderTest />
      </div>
    );
  }
}

export default App;
