let app = (function (mapboxgl) {
    let pub = {},
        _map,
        _geocoder,
        _points = [],
        _markerLocations = [],
        _stepsBetweenPoints = 25,
        _timeBetweenSteps = 50;

    pub.init = () => {
        mapSetup();
        uiSetup();
    };
    
    function mapSetup() {
        mapboxgl.accessToken = 'pk.eyJ1Ijoib25ldGhydTIiLCJhIjoiY2lvOWNtMGkxMDMyNHY2a3FpMWZtejRvbCJ9.fvCj4Thw_6POMXE8FoMPWw';
        _map = new mapboxgl.Map({
            container: 'map', // container id
            style: 'mapbox://styles/mapbox/bright-v9', //stylesheet location
            center: [-98, 40], // starting position, Evanston
            zoom: 4 // starting zoom
        });

        _geocoder = new mapboxgl.Geocoder({
            flyTo: false,
            placeholder: 'Add a Location'
        });
        _map.addControl(_geocoder);
        _geocoder.on('result', geoQueryCallback);
    }
    
    function uiSetup() {
        $(".play-route").click(() => {
           playRoute(); 
        });
    }

    function geoQueryCallback(result) {
        result.result.xy = getLatLngFromPoint(result);
        _points.push(result);
        if(_points.length >= 2) {
            $(".play-route").prop('disabled', false);
        }
        
        $("#locations").append("<li>" + result.result.text + "</li>");
        _geocoder._clear();
        $('.mapboxgl-ctrl-geocoder input').focus();
    }



    function getLatLngFromPoint(point) {
        return [point.result.center[0], point.result.center[1]];
    }

    function getLineFromPoints(a, b, stepCount) {
        const aLL = getLatLngFromPoint(a);
        const bLL = getLatLngFromPoint(b);
        let line = [aLL];
        
        let stepPerc = Number((100 / stepCount).toFixed(2)) / 100;
        let stepIter = stepPerc;
        for(let i = 0; i < stepCount; i++) {
            let temp = [ linearInterpolation(aLL[0], bLL[0], stepIter), linearInterpolation(aLL[1], bLL[1], stepIter) ];
            line.push(temp);
            stepIter += stepPerc;
        }
        line.push(bLL);
        return line;
    }
    
    

    function convertPointsToRoute() {       
        let route = [];
        for (const [i, obj] of enumerate(_points)) { 
            _markerLocations.push(obj);
            if (_points.length <= i + 1) {
                break;
            } else {
                route = route.concat(getLineFromPoints(obj, _points[i + 1], _stepsBetweenPoints));
                if(i+1 < _points.length) {
                    route.pop();
                }
            }
        };

        return route;
    }
    
    function addMarker(point) {
        _map.addSource("markers", {
            "type": "geojson",
            "data": {
                "type": "FeatureCollection",
                "features": [{
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": getLatLngFromPoint(point)
                    },
                    "properties": {
                        "title": point.text,
                    }
                }]
            }
        });
    }

    function playRoute() {
        let route = convertPointsToRoute();
        let routeTraveled = [route.shift(), route.shift()];
        
        //setup map to first point
        _map.zoomTo(6);
        _map.setCenter(routeTraveled[0]);
        
        
        let data = {
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "LineString",
                "coordinates": routeTraveled
            }
        };
        let source = new mapboxgl.GeoJSONSource({ data: data })

        _map.addSource("route", source);

        for (const [i, point] of enumerate(route)) {
            setTimeout(function () {
                routeTraveled.push(point);
                source.setData(data);                
                _map.setCenter(point);
                

                
            }, _timeBetweenSteps + i * 180)
        }

        _map.addLayer({
            "id": "route",
            "type": "line",
            "source": "route",
            "layout": {
                "line-join": "round",
                "line-cap": "round"
            },
            "paint": {
                "line-color": "red",
                "line-width": 6
            }
        });
    };
    
    
    function linearInterpolation(start, end, percentage) {
        return start + (end - start) * percentage;
    }
    
    
    function* enumerate(iterable) {
        let i = 0;

        for (const x of iterable) {
            yield [i, x];
            i++;
        }
    }

    return pub;
})(mapboxgl);

Array.prototype.contains = function(obj) {
    let i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}