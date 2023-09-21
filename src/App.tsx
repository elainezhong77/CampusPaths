/*
 * Copyright (C) 2022 Kevin Zatloukal and James Wilcox.  All rights reserved.  Permission is
 * hereby granted to students registered for University of Washington
 * CSE 331 for use solely during Autumn Quarter 2022 for purposes of
 * the course.  No other use, copying, distribution, or modification
 * is permitted without prior written consent. Copyrights for
 * third-party components of this work must be honored.  Instructors
 * interested in reusing these course materials should contact the
 * author.
 */

import React, {Component} from 'react';
import Map from "./Map";

// Allows us to write CSS styles inside App.css, any styles will apply to all components inside <App />
import "./App.css";
import {Simulate} from "react-dom/test-utils";
import select = Simulate.select;

interface AppState {
  // the start of the path
  start : string;
  // the end of the path
  end : string;
  // the list of all campus buildings
  buildings : string[];
  // the list of all segments on campus
  edges : Edge[];
}

export interface Edge {
  cost: number; // cost of the edge
  x1: number; // x coordinate of start point
  y1: number; // y coordinate of start point
  x2: number; // x coordinate of end point
  y2: number; // y coordinate of end point
}

/**
 * App contains Map and input button components.
 * Displays map, user input in dropdown, and breakdown of the route.
 */
class App extends Component<{}, AppState> {

  constructor(props: any) {
    super(props);
    this.state = {
      // TODO: store edges in this state
      start : "Please select a building",
      end : "Please select a building",
      buildings : [],
      edges : [],
    };
    this.getBuildings();
  }

  // Handles the dropdown lists and stores shortName in start and end
  handleChange = (event : any, flag : boolean) => {
    if (flag) {
      this.setState({
        start: event.target.value,
      })
    } else {
      this.setState({
        end: event.target.value,
      })
    }
    // clears path whenever a new building is pressed
    this.setState({
      edges : []
    });
  }

  // Handles the button draw event
  // Finds the minimum cost path to draw between start and end
  handleDraw = (event : any) => {
    this.findPath();
  }

  // Handles the clear button event
  // Clears the lines on the map
  handleClear = (event: any) => {
    this.setState({
      edges : []
    });
  }

  // Creates a list of campus buildings by fetching a map of strings
  // In the format short name (long name)
  getBuildings = async () => {
    try {
      let response = await fetch("http://localhost:4567/buildings");
      if (!response.ok) {
        alert("The status is wrong! Expected: 200, Was: " + response.status);
        return;
      }
      let object = (await response.json());
      if (object === null) {
        console.log("no list found");
      } else {
        let list: string[] = [];
        // for all buildings identify short and long name
        Object.entries(object).forEach(entry => {
          let key : string = entry[0]; // short name
          let value : any = entry[1]; // long name
          list.push(key + " (" + value + ")");
        });
        this.setState({
          buildings : list
        });
      }
    } catch (e) {
      alert("There was an error contacting the server.");
      console.log(e);
    }
  };

  // Creates a list of edges by fetching a list of segments
  findPath = async () => {
    if (this.state.start == "Please select a building"
      || this.state.end == "Please select a building") {
      alert("Please select a building");
      return;
    }
    try {
      let response = await fetch("http://localhost:4567/findPath?start="
        + this.state.start + "&end=" + this.state.end);
      if (!response.ok) {
        alert("The status is wrong! Expected: 200, Was: " + response.status);
        return;
      }
      let object = (await response.json());
      if (object === null) {
        console.log("no list found");
      } else {
        let all: Edge[] = [];
        let path = object['path']; // list of segments that build up path
        for (let i = 0; i < path.length; i++) {
          let segment = path[i];
          let start = segment['start']; // start point
          let end = segment['end']; // end point
          let estimateCost = Math.round(parseFloat(segment['cost'])); // segment cost
          let edge: Edge = {
            x1: parseFloat(start['x']),
            y1: parseFloat(start['y']),
            x2: parseFloat(end['x']),
            y2: parseFloat(end['y']),
            cost: estimateCost,
          };
          all.push(edge);
        }
        this.setState({
          edges : all
        });
      }
    } catch (e) {
      alert("There was an error contacting the server.");
      console.log(e);
    }
  };

  render() {
    let list : any[] = [];
    list.push(<option>Please select a building</option>)
    for (let i = 0; i < this.state.buildings.length; i++) {
      // substring to get only the short name
      let shortName : string = this.state.buildings[i].substring(0, 3);
      // if there are more than 3 parentheses, use the first token up to first ')'
      let tokens : string[] = this.state.buildings[i].split(")")
      if (tokens.length > 3) {
        shortName = tokens[0] + ")";
      }
      // set the value attribute to short name, but display all
      list.push(
        <option value={shortName}>{this.state.buildings[i]}</option>
      );
    }
    let listSegment: any[] = [];
    listSegment.push(<p>Breakdown of total distance of the route:</p>);
    let edge : Edge[] = this.state.edges;
    let totalCost : number = 0;
    // for all segments, output the cost of each path along with its coordinates
    for (let i : number = 0; i < edge.length; i++) {
      listSegment.push(<p>{i + 1}. Walk {edge[i].cost} feet ({edge[i].x1},
        {edge[i].y1} to {edge[i].x2}, {edge[i].y2}) </p>);
      totalCost += edge[i].cost;
    }
    return (
      <div>
        <h1 id="app-title">Campus Paths Finder </h1>
          <div>
            <Map lineList={this.state.edges}/>
          </div>
            Enter your start location:
            <select onChange={evt => this.handleChange(evt, true)}>
              {list}
            </select>
            <p></p>
            Enter your end location:
            <select onChange={evt => this.handleChange(evt, false)}>
              {list}
            </select>
            <p></p>
          <button onClick={this.handleDraw}>Draw Path</button>
          <button onClick={this.handleClear}>Clear Path</button>
        <p> Total Distance: {totalCost} Feet! </p>
        {listSegment}
        </div>
    );
  }
}

export default App;
