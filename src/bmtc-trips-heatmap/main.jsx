import * as React from "react";
import { createRoot } from "react-dom/client";
import _ from "lodash";
import mapboxgl from "mapbox-gl";
import '@material-design-icons/font/filled.css';

import busData from "./bmtc.csv";

import { MAPBOX_TOKEN } from "../utils/constants";

mapboxgl.accessToken = MAPBOX_TOKEN;

const mapData = {
  "type": "FeatureCollection",
  features: _.map(busData, b => ({
    type: "Feature",
    "id": b.stop,
    "properties": {
      "id": b.stop,
      "routes": b.routes,
      "trips": b.trips,
    },
    "geometry": {
      "type": "Point",
      "coordinates": [b.lon, b.lat]
    },
  })),
};

// console.log(mapData);

class Container extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lat: "12.9737",
      lng: "77.6081",
      zoom : "10.39",
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
      style: "mapbox://styles/mapbox/streets-v11",
      center: [lng, lat],
      zoom: zoom,
      // minZoom: 10,
      // maxZoom: 18,
    });
    map.dragRotate.disable();
    map.touchZoomRotate.disableRotation();
    this.map = map;
  };

  renderMapData = () => {
    this.map.addSource('bustrips', {
      'type': 'geojson',
      'data': mapData
    });

    this.map.addLayer(
      {
        'id': 'bus-trips-heat',
        'type': 'heatmap',
        'source': 'bustrips',
        'paint': {
          'heatmap-weight': ['interpolate', ['linear'], ['get', 'trips'], 0, 0, 1000, 1],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 0.1, 100, 1],
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(33,102,172,0)',
            0.2, 'rgb(103,169,207)',
            0.4, 'rgb(209,229,240)',
            0.6, 'rgb(253,219,199)',
            0.8, 'rgb(239,138,98)',
            1, 'rgb(178,24,43)'
          ],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 9, 20],
          'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 5, 0, 12, 0.8]
        }
      },
      // 'bustrips'
    );

    this.map.addLayer({
      'id': 'busstops',
      'type': 'circle',
      'source': 'bustrips',
      'minzoom': 12.5,
      'paint': {
        'circle-color': '#4264fb',
        'circle-radius': 6,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
      }
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

    const popup = new mapboxgl.Popup({
      closeButton: true,
      closeOnClick: false
    });

    this.map.on('mouseenter', 'busstops', (e) => {
      this.map.getCanvas().style.cursor = 'pointer';

      const coordinates = e.features[0].geometry.coordinates.slice();
      const {
        id,
        trips,
        routes,
      } = e.features[0].properties;


      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      popup
        .setLngLat(coordinates)
        .setHTML(`<div class="bustrips-popup">
    <h3>${id}</h3>
    <p>${trips} trips<br />${routes} routes</p>
</div>`)
        .addTo(this.map);
    });

    this.map.on('mouseleave', 'places', () => {
      this.map.getCanvas().style.cursor = '';
      popup.remove();
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
