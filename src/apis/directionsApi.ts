import axios from "axios";

const directionsApi = axios.create({
    baseURL: 'https://api.mapbox.com/directions/v5/mapbox/driving',
    params: {
        alternatives: false,
        geometries: 'geojson',
        overview: 'simplified',
        steps: 'false',
        access_token: 'pk.eyJ1IjoiZmFiYzIwMjEiLCJhIjoiY2trMnFiZno2MTNucDJ2dDFzZXlnYjVxaCJ9.JjoFFJseYMFqAmZ54IPo_Q'
    }
})

export default directionsApi