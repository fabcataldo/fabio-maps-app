import axios from "axios";

const searchApi = axios.create({
    baseURL: 'https://api.mapbox.com/geocoding/v5/mapbox.places',
    params: {
        limit: 5,
        language: 'es',
        access_token: 'pk.eyJ1IjoiZmFiYzIwMjEiLCJhIjoiY2trMnFiZno2MTNucDJ2dDFzZXlnYjVxaCJ9.JjoFFJseYMFqAmZ54IPo_Q'
    }
})

export default searchApi