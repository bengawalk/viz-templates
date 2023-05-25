import * as React from "react";
import _ from "lodash";
import { createRoot } from "react-dom/client";
import mapboxgl from "mapbox-gl";
import '@material-design-icons/font/filled.css';

import { MAPBOX_TOKEN } from "../utils/constants";

import metroData from "./metro_feeder.json";
import circleFeatures from "./circles_edited.json";

mapboxgl.accessToken = MAPBOX_TOKEN;

const CIRCLE_DIAMETER = 3;

class Container extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lat: "12.9487",
      lng: "77.6145",
      zoom: "11.56",
    };
    this.mapContainer = React.createRef();
    this.autoplayInterval = null;
  }

  componentDidMount() {
    this.initMap();
    this.map?.on("load", () => {
      this.renderMapData();
      this.addMapEvents();
    });
  }

  initMap = () => {
    const { lng, lat, zoom } = this.state;
    const map = new mapboxgl.Map({
      container: this.mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [lng, lat],
      zoom: zoom,
      minZoom: 10,
      maxZoom: 18,
    });
    map.dragRotate.disable();
    map.touchZoomRotate.disableRotation();
    this.map = map;
  };

  renderMapData = () => {
    const routeFeatures = _.filter(metroData.features, f => f.geometry.type === "LineString");
    const stopsFeatures = _.filter(metroData.features, f => f.geometry.type === "Point");

    this.map.addSource("routes", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: routeFeatures,
      },
    });
    this.map.addSource("stops", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: stopsFeatures,
      },
    });
    this.map.addSource("circles", {
      type: "geojson",
      data: circleFeatures,
    });
    this.map.addLayer({
      id: 'circles',
      source: 'circles',
      type: 'fill',
      paint: {
        'fill-color': [
          'match',
          ['get', 'ref'],
          'Purple',
          '#01bfff',
          'Green',
          '#01bfff',
          '#ffffff'
        ],
        'fill-opacity': 0.2
      },
    });
    this.map.addLayer({
      id: "routes",
      source: "routes",
      type: "line",
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": [
          'match',
          ['get', 'ref'],
          'Purple',
          '#5c0253',
          'Green',
          '#488f31',
          '#ffffff'
        ],
        "line-width": 3,
      },
    });
    this.map.addLayer({
      id: 'stops',
      source: 'stops',
      type: 'circle',
      paint: {
        'circle-color': "#ffffff",
        "circle-stroke-color": "blue",
        "circle-stroke-width": 1,
        'circle-radius': 4,
      },
    });
  }

  addMapEvents = () => {
    this.map.on("move", () => {
      this.setState({
        lng: this.map.getCenter().lng.toFixed(4),
        lat: this.map.getCenter().lat.toFixed(4),
        zoom: this.map.getZoom().toFixed(2),
      });
    });
  }

  render() {
    return (
      <div id="flyover-viz-wrapper">
        <div id="flyover-viz-map" ref={this.mapContainer} />
      </div>
    );
  }
}

const root = createRoot(document.getElementById("root"));
root.render(<Container />);
