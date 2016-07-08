// JavaScript
// var App = React.createClass({
//     getInitialState: function () {
//         return { message: "" }
//     },
//     updateMessage: function (e) {
//         this.setState({ message: e.target.value })
//     },
//     render: function () {
//         return (
//           <div>
//               <input type="text" onChange={this.updateMessage} />
//               <p>{this.state.message}</p>
//           </div>
//         );
//     }
// });
//
// ReactDOM.render(
//     <App />,
//     document.getElementById('app-container')
// )

// ES2015
// import React from 'react';
// import ReactDOM from 'react-dom';
class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            message: ""
        };
        this.updateMessage = this.updateMessage.bind(this)
    }

    updateMessage(e) {
        this.setState({ message: e.target.value });
    }

    render() {
        return (
          <div>
              <input type="text" onChange={this.updateMessage} />
              <p>{this.state.message}</p>
          </div>
        );
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('app-container')
)
