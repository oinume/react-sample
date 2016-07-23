import React from 'react';
import ReactDOM from 'react-dom';
import alt from './alt';
import connectToStores from 'alt-utils/lib/connectToStores';

class CounterActionsClass {

  plusCounter() {
    return {};
  }

  minusCounter() {
    return {};
  }

}
//export default alt.createActions(CounterActionsClass);
const CounterActions = alt.createActions(CounterActionsClass);

class CounterStoreClass {
  constructor() {
    this.bindListeners({
      handlePlusCounter: CounterActions.plusCounter,
      handleMinusCounter: CounterActions.minusCounter,
    });
    this.state = {
      counter: 0,
    };
  }

  handlePlusCounter() {
    this.setState({counter: this.state.counter + 1 })
  }

  handleMinusCounter() {
    this.setState({counter: this.state.counter - 1 })
  }
}

//export default alt.createStore(CounterStore, 'CounterStore');
const CounterStore = alt.createStore(CounterStoreClass, 'CounterStore');

class CounterAppView extends React.Component {
  static getStores() {
    return [CounterStore];
  }

  static getPropsFromStores() {
    console.log("getPropsFromStores()", CounterStore.getState());
    return CounterStore.getState();
  }

  constructor(props) {
    super(props)
  }

  render() {
    console.log("counter = ", this.props.counter);

    return (
      <div>
        <span>count: {this.props.counter}</span>
        <div>
          <button onClick={CounterActions.plusCounter}>+1</button>
          <button onClick={CounterActions.minusCounter}>-1</button>
        </div>
      </div>
    );
  }
}
const CounterApp = connectToStores(CounterAppView);

ReactDOM.render(
  <CounterApp />,
  document.getElementById('app-container')
);
