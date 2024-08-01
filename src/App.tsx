import React, { Component } from 'react';
import DataStreamer, { ServerRespond } from './DataStreamer';
import Graph from './Graph';
import './App.css';

/**
 * State declaration for <App />
 */
interface IState {
  data: ServerRespond[],  // Array to hold the server responses
  intervalId: NodeJS.Timeout | null, // Track the interval ID to clear it later
  showGraph: boolean, // State to determine whether to show the graph
}

/**
 * The parent element of the react app.
 * It renders title, button and Graph react element.
 */
class App extends Component<{}, IState> {
  constructor(props: {}) {
    super(props);

    this.state = {
      // data saves the server responds.
      // We use this state to parse data down to the child element (Graph) as element property
      data: [], // Initialize data as an empty array
      intervalId: null, // Initialize intervalId as null
      showGraph: false, // Initialize showGraph to false, hiding the graph initially
    };
  }

  /**
   * Render Graph react component with state.data parse as property data
   */
  renderGraph() {
    // Only render the graph if showGraph is true
    if (this.state.showGraph) {
      return (<Graph data={this.state.data}/>);
    }
    return null; // Otherwise, render nothing
  }

  /**
   * Get new data from server and update the state with the new data
   */
  getDataFromServer() {
    // Set the state to show the graph
    this.setState({ showGraph: true });

    // Set an interval to repeatedly request data every 100ms
    const intervalId = setInterval(() => {
      DataStreamer.getData((serverResponds: ServerRespond[]) => {
        // Update the state by creating a new array of data that consists of
        // Previous data in the state and the new data from server
        // Append new data to the existing state data
        this.setState({ data: [...this.state.data, ...serverResponds] });
      });
    }, 100); // 100ms interval

    // Store the interval ID in the state so it can be cleared later
    this.setState({ intervalId });
  }

  componentWillUnmount() {
    // Clear the interval when the component unmounts to avoid memory leaks
    if (this.state.intervalId) {
      clearInterval(this.state.intervalId);
    }
  }

  /**
   * Render the App react component
   */
  render() {
    return (
      <div className="App">
        <header className="App-header">
          Bank & Merge Co Task 2
        </header>
        <div className="App-content">
          <button className="btn btn-primary Stream-button"
            // when button is click, our react app tries to request
            // new data from the server.
            // As part of your task, update the getDataFromServer() function
            // to keep requesting the data every 100ms until the app is closed
            // or the server does not return anymore data.
            onClick={() => {this.getDataFromServer()}}>
            Start Streaming Data
          </button>
          <div className="Graph">
            {this.renderGraph()}
          </div>
        </div>
      </div>
    )
  }
}

export default App;
