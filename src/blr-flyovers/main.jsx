import * as React from "react";
import { createRoot } from "react-dom/client";
import _ from "lodash";
import mapboxgl from "mapbox-gl";
import '@material-design-icons/font/filled.css';

import { MAPBOX_TOKEN } from "../utils/constants";

import flyoverData from "./data.json";

const TIMELINE_DATA = {
  "Agara Flyover": 2010,
  "Ananda Rao Flyover": 2006,
  "BDA Junction Flyover": 2008,
  "BGS Flyover": 1998,
  "Basaveshwaranagar Flyover": 2023,
  "Bellandur Flyover": 2012,
  "Bhadrappa Layout Flyover": 2014,
  "Dairy Circle Flyover": 2004,
  "Delmia Circle Flyover": 2018,
  "Devarabeesanahalli Flyover": 2013,
  "Doddanekundi Flyover": 2018,
  "Domlur Flyover": 2006,
  "Ganga Nagar Flyover": 0,                         // TODO
  "HSR Layout 14th Main Flyover": 2012,
  "Hebbal Flyover": 2003,
  "Hennur Flyover": 2018,
  "Ibblur Flyover": 2010,
  "KEB Junction Flyover": 2017,
  "Kalyan Nagar Flyover": 2012,
  "Kanteerava Studio Flyover": 2015,
  "Kengeri Flyover": 0,                         // TODO
  "Kittur Rani Chenamma Circle Flyover": 2017,
  "Lingarajapuram Flyover": 2004,
  "Mahadevapura Flyover": 0,                         // TODO
  "Manjunath Nagar Flyover": 2018,
  "Mother Dairy Circle Flyover": 2020,
  "Nagawara Flyover": 2014,
  "Nayandahalli Flyover": 2012,
  "Rajajinagar 1st Block Flyover": 2016,
  "Rashtrotthana Junction Flyover": 2021,
  "Richmond Circle Flyover": 0,                         // TODO
  "Shivanagar Flyover": 2021,
  "Silk Board Flyover": 0,                         // TODO
  "Sumanahalli Flyover": 2010,
  "Tin Factory Flyover": 2002,
  "Vanivilas Flyover": 2005,
  "Wheeler Road Flyover": 2013,
  "Yeshwantpura Circle Flyover": 2009
}

const getCompletedFlyoversGeojson = (year) => {
  return {
    ...flyoverData,
    features: _.filter(flyoverData.features, f => TIMELINE_DATA[f.properties["@relations"][0].reltags?.name] <= year)
  };
};

mapboxgl.accessToken = MAPBOX_TOKEN;

class Container extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      autoplay: false,
      inputYear: 2023,
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
      minZoom: 10,
      maxZoom: 18,
    });
    map.dragRotate.disable();
    map.touchZoomRotate.disableRotation();
    this.map = map;
  };

  renderMapData = () => {
    this.map.addSource("flyovers", {
      type: "geojson",
      data: getCompletedFlyoversGeojson(2023),
    });
    this.map.addLayer({
      id: "flyovers",
      source: "flyovers",
      type: "line",
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "#4264fb",
        "line-width": 2.5,
      },
    });
  }

  toggleAutoplay = () => {
    const { autoplay } = this.state;
    if(autoplay) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    } else {

      this.autoplayInterval = setInterval(() => {
        this.setState(({ inputYear }) => ({ inputYear: inputYear === 2023 ? 1998 : inputYear + 1 }))
      }, 300);
    }
    this.setState({
      autoplay: !autoplay,
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

  componentDidUpdate() {
    const { inputYear } = this.state;

    const flyoversSource = this.map.getSource("flyovers");
    flyoversSource.setData(getCompletedFlyoversGeojson(inputYear));
  }

  render() {
    const { autoplay, inputYear } = this.state;
    return (
      <div id="flyover-viz-wrapper">
        <div id="flyover-viz-map" ref={this.mapContainer} />
        <div className="timeline-wrapper">
          <button className="timeline-play-toggle" onClick={this.toggleAutoplay}>
            <span className="material-icons">
              {autoplay ? "pause" : "play_arrow"}
            </span>
          </button>
          <input
            type="range"
            min={1998}
            max={2023}
            value={inputYear}
            onChange={e => {
              this.setState({ inputYear: _.toNumber(e.target.value) })
              if(autoplay) {
                this.toggleAutoplay();
              }
            }}
            className="timeline-slider"
          />
          <div className="timeline-label">
            { inputYear }
          </div>
        </div>
      </div>
    );
  }
}

const root = createRoot(document.getElementById("root"));
root.render(<Container />);
