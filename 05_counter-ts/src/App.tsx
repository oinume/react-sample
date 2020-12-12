import React from 'react';
//import ReactDOM from 'react-dom';

type CounterAppProps = {}

type CounterAppState = {
    counter: number
}

export default class CounterApp extends React.Component<{}, CounterAppState> {
    constructor(props: CounterAppProps) {
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

type CounterProps = {
    value: number
    onClickPlus: () => void
    onClickMinus: () => void
}

class Counter extends React.Component<CounterProps> {
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

// Counter.propTypes = {
//     value:        PropTypes.number.isRequired,
//     onClickPlus:  PropTypes.func.isRequired,
//     onClickMinus: PropTypes.func.isRequired,
// };

// ReactDOM.render(
//     <CounterApp />,
//     document.getElementById('app-container')
// );

// import React from 'react';
// import logo from './logo.svg';
// import './App.css';
//
// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.tsx</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }
//
// export default App;
