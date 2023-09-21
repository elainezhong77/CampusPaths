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

import { LatLngExpression } from "leaflet";
import React, { Component } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import MapLine from "./MapLine";
import { UW_LATITUDE_CENTER, UW_LONGITUDE_CENTER } from "./Constants";
import {Edge} from "./App";

// This defines the location of the map. These are the coordinates of the UW Seattle campus
const position: LatLngExpression = [UW_LATITUDE_CENTER, UW_LONGITUDE_CENTER];

interface MapProps {
  // TODO: Define the props of this component. You will want to pass down edges
  // lineList is a list of edges to be drawn on the map
  // lineList prop is passed from App with Edge array type data
  // Used to draw lines on the map
  lineList : Edge[]
}

interface MapState {
}

/**
 * A map component that displays a map and drawn lines to the user.
 */
class Map extends Component<MapProps, MapState> {
  render() {
    console.log("inside map print");
    let allLines: any[] = [];
    // Loop through lineList and create MapLine components
    for (let i = 0; i < this.props.lineList.length; i++) {
      let edge = this.props.lineList[i];
      allLines.push(
        <div>
          <MapLine key={i} color="red" x1={edge.x1} y1={edge.y1} x2={edge.x2} y2={edge.y2}/>
        </div>);
    }
    return (
      <div id="map">
        <MapContainer
          center={position}
          zoom={15}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {
            // renders all the MapLine components
            allLines
          }
        </MapContainer>
      </div>
    );
  }
}

export default Map;
