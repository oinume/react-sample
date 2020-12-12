import React from 'react';

type CounterAppProps = {}

type CounterAppState = {
    counter: number
}

class CounterApp extends React.Component<{}, CounterAppState> {
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

export default CounterApp
