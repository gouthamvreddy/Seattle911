import React, {Component} from 'react';
import render from 'react-dom';
import mapboxgl from 'mapbox-gl/dist/mapbox-gl.js';

import styles from './Map.css';
import config from '../../../config.js';

mapboxgl.accessToken = config.MAPBOX_TOKEN;
const MAPBOX_STYLES = config.MAPBOX_STYLES;

class Map extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    let map = new mapboxgl.Map({
      container: 'map',
      style: MAPBOX_STYLES,
      center: [-122.3, 47.6162],
      zoom: 12
    });

    map.on('load', function() {

        // Add a new source from our GeoJSON data
        map.addSource("incidents", {
            type: "geojson",
            // Get GeoJSON data
            data: "http://localhost:3000",
        });

        map.addLayer({
            'id': 'incidents',
            'type': 'circle',
            'source': 'incidents',
            'source-layer': 'incidents',
            'paint': {
                // make circles larger as the user zooms from z12 to z22
                'circle-radius': {
                    'base': 1.75,
                    'stops': [[12, 2], [22, 180]]
                },
                // color circles by super group
                'circle-color': {
                    property: 'event_super_group',
                    type: 'categorical',
                    stops: [
                        ['VIOLENT', '#e55e5e'],   //red
                        ['PROPERTY', '#0099cc'],  //blue
                        ['VEHICLE', '#33cc33'],   //green
                        ['VICE', '#fbb03b'],      //yellow
                        ['MISC', '#000033']]      //black
                }
            }
        });

        // Create a popup, but don't add it to the map yet.
        let popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false
        });

        map.on('mousemove', function(e) {
            let features = map.queryRenderedFeatures(e.point, { layers: ['incidents'] });
            // Change the cursor style as a UI indicator.
            map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';

            if (!features.length) {
                popup.remove();
                return;
            }

            let feature = features[0];

            // Populate the popup and set its coordinates
            // add description to popup
            popup.setLngLat(feature.geometry.coordinates)
                .setHTML(feature.properties.event_clearance_description)
                .addTo(map);
        });

      });
    }

  render() {
    return <div id="map" className={styles.map} />;
  }
}

export default Map;
