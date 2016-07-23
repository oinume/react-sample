import React from 'react';
import ReactDOM from 'react-dom';

class CounterApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      counter: 0,
    };
    this.handlePlus = this.handlePlus.bind(this);
    this.handleMinus = this.handleMinus.bind(this);
  }

  handlePlus() {
    this.setState({ counter: this.state.counter + 1 });
  }

  handleMinus() {
    this.setState({ counter: this.state.counter - 1 });
  }

  render() {
    return (
      <div>
        <Counter value={this.state.counter}
                 onClickPlus={this.handlePlus}
                 onClickMinus={this.handleMinus} />
      </div>
    );
  }
}

class Counter extends React.Component {
  render() {
    return (
      <div>
        <span>count: {this.props.value}</span>
        <div>
          <button onClick={this.props.onClickPlus}>+1</button>
          <button onClick={this.props.onClickMinus}>-1</button>
        </div>
      </div>
    );
  }
}

Counter.propTypes = {
  value:        React.PropTypes.number.isRequired,
  onClickPlus:  React.PropTypes.func.isRequired,
  onClickMinus: React.PropTypes.func.isRequired,
};

ReactDOM.render(
  <CounterApp />,
  document.getElementById('app-container')
);
