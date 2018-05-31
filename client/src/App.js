import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: null
    };
  }

  componentDidMount() {
    fetch('api/get')
      .then(response => response.json())
      .then(json => this.setState({ text: json.data }))
      .catch(error => alert(error));
  }

  render() {
    return (
      <div className="App">
        {this.state.text}
      </div>
    );
  }
}

export default App;
