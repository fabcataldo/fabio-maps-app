import { AnySourceData, LngLatBounds, Map, Marker, Popup } from 'mapbox-gl';
import { useContext, useEffect, useReducer } from 'react'
import { mapReducer } from './mapReducer';
import { MapContext } from './MapContext';
import { PlacesContext } from '../places/PlacesContext';
import { directionsApi } from '../../apis';
import { DirectionsResponse } from '../../interfaces/directions';

export interface MapState {
    isMapReady: boolean;
    map?: Map;
    markers: Marker[];
}

const INITIAL_STATE: MapState = {
    isMapReady: false,
    map: undefined,
    markers: []
}

interface Props {
    children: JSX.Element | JSX.Element[]
}

export const MapProvider = ({ children }: Props) => {
    const [state, dispatch] = useReducer(mapReducer, INITIAL_STATE);
    const { places } = useContext(PlacesContext)

    useEffect(() => {
      state.markers.forEach(marker => {
        marker.remove()
      })
      const newMarkers: Marker[] = []

      for (const place of places) {
        const [lng, lat] = place.center;
        const popup = new Popup()
            .setHTML(`
                <h6>${place.text_es}</h6>
                <p>${place.place_name_es}</p>
            `)
        const newMarker = new Marker()
            .setPopup(popup)
            .setLngLat([lng,lat])
            .addTo(state.map!)

        newMarkers.push(newMarker)

        //todo: Limpiar polyline
        
        dispatch({type:'setMarkers', payload: newMarkers})
      }
    }, [places])
    

    const setMap = (map: Map) => {
        const myLocationPopup = new Popup()
            .setHTML(`
                <h4>aqui estoy</h4>
                <p>en algun lugar del mundo</p>
            `)
        new Marker(
            {
                color: '#61dafb'
            }
        )
            .setLngLat(map.getCenter())
            .setPopup(myLocationPopup)
            .addTo(map)
        dispatch({type: 'setMap', payload: map})
    }

    const getRouteBetweenPoints = async(start: [number, number], end: [number, number]) => {
        const resp = await directionsApi.get<DirectionsResponse>(`/${start.join(',')};${end.join(',')}`)

        //lo de abajo es si por si quiero hacer algo aparte, con la distancia y duracion.. etc.
        const {distance, duration, geometry} = resp.data.routes[0]
        const {coordinates: coords} = geometry
        let kms = distance / 1000
            kms = Math.round(kms * 100)
            kms /= 100
        
        const minutes = Math.floor(duration/60)
        console.log('distance and minutes')
        console.log({kms, minutes})

        const bounds = new LngLatBounds(
            start,
            start
        )

        for (const coord of coords) {
            const newCoord: [number, number] = [coord[0], coord[1]]
            bounds.extend(newCoord)
        }

        state.map?.fitBounds(bounds, {
            padding: 200
        })

        //polyline
        const sourceData: AnySourceData = {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        properties: {},
                        geometry: {
                            type: 'LineString',
                            coordinates: coords
                        }
                    }
                ]
            }
        }

        if(state.map?.getLayer('RouteString')){
            state.map.removeLayer('RouteString')
            state.map.removeSource('RouteString')
        }

        //el routestring es porque se quiere mantener este id
        //porque es la misma intención, que es generar la polyline
        //para la ruta
        state.map?.addSource('RouteString', sourceData)
        state.map?.addLayer({
            id: 'RouteString',
            type: 'line',
            source: 'RouteString',
            layout: {
                'line-cap': 'round',
                'line-join': 'round'
            },
            paint: {
                'line-color': 'black',
                'line-width': 3
            }
        })
    }

    return (
        <MapContext.Provider value={{
            ...state,
            setMap,
            getRouteBetweenPoints
        }}>
            {children}
        </MapContext.Provider>
    )
}
