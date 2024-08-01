import React, { Component } from 'react';
import { Table } from '@finos/perspective';
import { ServerRespond } from './DataStreamer';
import './Graph.css';

/**
 * Props declaration for <Graph />
 */
interface IProps {
  data: ServerRespond[], // Data passed from parent component
}

/**
 * Perspective library adds load to HTMLElement prototype.
 * This interface acts as a wrapper for Typescript compiler.
 */
interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void, // Method to load table into Perspective viewer
}

/**
 * React component that renders Perspective based on data
 * parsed from its parent through data property.
 */
class Graph extends Component<IProps, {}> {
  // Perspective table
  table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer'); // Create Perspective viewer element
  }

  componentDidMount() {
    // Get element to attach the table from the DOM.
    const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

    // Define the schema for the Perspective table
    const schema = {
      stock: 'string',
      top_ask_price: 'float',
      top_bid_price: 'float',
      timestamp: 'date',
    };

    // Check if perspective worker is available
    if (window.perspective && window.perspective.worker()) {
      // Create a new table with the defined schema
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.
      elem.load(this.table);

      // Add more Perspective configurations here.
      elem.setAttribute('view', 'y_line'); // Set the view to a line graph
      elem.setAttribute('column-pivots', '["stock"]'); // Distinguish stocks by column
      elem.setAttribute('row-pivots', '["timestamp"]'); // Pivot rows by timestamp
      elem.setAttribute('columns', '["top_ask_price"]'); // Show only the top_ask_price column
      elem.setAttribute('aggregates', JSON.stringify({
        stock: 'distinct count',
        top_ask_price: 'avg',
        top_bid_price: 'avg',
        timestamp: 'distinct count',
      })); // Set the aggregate functions for the columns

      // Load initial empty data to display the table structure
      this.table.update([]);
    }
  }

  componentDidUpdate() {
    if (this.table) {
      // Everytime the data props is updated, insert the data into Perspective table
      // As part of the task, you need to fix the way we update the data props to
      // avoid inserting duplicated entries into Perspective table again.
      // Remove duplicates before updating the table
      const uniqueData = this.props.data.filter((value, index, self) =>
        index === self.findIndex((t) => (
          t.timestamp === value.timestamp && t.stock === value.stock
        ))
      );

      // Update the table with the filtered unique data
      this.table.update(uniqueData.map((el: any) => {
        // Format the data from ServerRespond to the schema
        return {
          stock: el.stock,
          top_ask_price: el.top_ask && el.top_ask.price || 0,
          top_bid_price: el.top_bid && el.top_bid.price || 0,
          timestamp: el.timestamp,
        };
      }));
    }
  }
}

export default Graph;
