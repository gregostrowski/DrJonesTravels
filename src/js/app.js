let app = (function (mapboxgl) {
    let pub = {},
        _map,
        _geocoder,
        _locations = [], //array to keep our destination locations
        _layers = [],
        _audio,
        _inTransit = false, //are we flying?
        _stepsBetweenPoints = 200; //# of points we'll add between locations

    //initializer
    pub.init = () => {
        mapSetup();
        uiSetup();
    };
    
    //set up map stuff
    function mapSetup() {
        mapboxgl.accessToken = 'pk.eyJ1Ijoib25ldGhydTIiLCJhIjoiY2lvOWNtMGkxMDMyNHY2a3FpMWZtejRvbCJ9.fvCj4Thw_6POMXE8FoMPWw';
        _map = new mapboxgl.Map({
            container: 'map', // container id
            style: 'mapbox://styles/onethru2/ciofwmylr003saimaiv2cg5ud', 
            center: [-98, 40], // starting position
            zoom: 4 // starting zoom
        });
        
        //add geocoder
        _geocoder = new mapboxgl.Geocoder({
            flyTo: false,
            placeholder: 'Add a Location'
        });
        _map.addControl(_geocoder);
        _geocoder.on('result', geoQueryCallback); //set up callback to capture geocode of destination location
        
        _map.addControl(new mapboxgl.Navigation());
    }
    
    //custom ui setup
    function uiSetup() {
        //sweet tunes
        _audio = new Audio('IndianaJones.mp3');
        _audio.volume = .2;
        
        //button to go
        $(".play-route").click(() => {
           playRoute(); 
        });
        
        //music controls
        $("#music").on('change', (e) => {
            if(e.target.checked === false) {
                _audio.pause(); //make sure we're always turning off music if user wants
            } else {
                //turn back on if they're mid flight
                if(_inTransit) {
                    _audio.play();
                }
            }
        });
    }
    
    function clearMap() {
        for(let layer of _layers) {
            _map.removeLayer(layer);
            _map.removeSource(layer);
        }
        _layers = [];
    }

    //capture geocode callback, add object to locations
    function geoQueryCallback(result) {
        result.xy = getCoords(result); //make lat/lng easy to access for comparisons
        _locations.push(result);
        if(_locations.length >= 2) {
            $(".play-route").prop('disabled', false);
        }
        
        //add new list item on UI
        $("#locations").append("<li>" + result.result.text + "</li>");
        //clear geocoder text of previous search
        _geocoder._clear();
    }

    //get the Lat/Lng from a geocode point object
    function getCoords(point) {
        return Array.isArray(point) ? point : point.result.geometry.coordinates;
    }
    
    function addMarker(point) {
        let srcName = "pt" + point.result.id;
        if(!_map.getSource(srcName)){
            _map.addSource(srcName, {
                "type": "geojson",
                "data": {
                    "type": "FeatureCollection",
                    "features": []
                }
            });

            _map.addLayer({
                "id": srcName,
                "source": srcName,
                "type": "circle",
                "paint": {
                    "circle-radius": 7,
                    "circle-color": "red"
                }
            });
            
            _map.getSource(srcName).setData(point.result.geometry);
            _layers.push(srcName);
        }
    }
    
    //Linear Interpolation for finding points on a line
    function linearInterpolation(start, end, percentage) {
        return start + (end - start) * percentage;
    }

    //Generates array of points that create a line between two points
    // param: a => starting point
    // param: b => ending point
    // param: stepCount => number of points in line
    function getLineFromPoints(a, b) {
        const aLL = getCoords(a);
        const bLL = getCoords(b);
        
        let stepPerc = Number((1 / _stepsBetweenPoints).toFixed(4)); //The progress. It is given in percentage, between 0 and 1.
        let stepIter = stepPerc;
        
        let line = [aLL]; //add first point        

        for(let i = 0; i < _stepsBetweenPoints; i++) {
            //create new point
            let temp = [ linearInterpolation(aLL[0], bLL[0], stepIter), linearInterpolation(aLL[1], bLL[1], stepIter) ];
            line.push(temp); // push it along
            stepIter += stepPerc;
        }
        line.push(bLL); // add last point
        return line;
    }
        
    //Loop over all points and create our entire route of lines
    function convertPointsToRoute() {       
        let route = [];
        for (const [i, obj] of enumerate(_locations)) { 
            if (_locations.length <= i + 1) {
                break;
            } else {
                route = route.concat(getLineFromPoints(obj, _locations[i + 1]));
            }
        };

        return route;
    }

    //Runs the route
    function playRoute() {
        if(_inTransit) {
            return; //we're already flying
        } 
        //lets go again, can't have duplicate source/layers
        if(_map.getLayer("route")) {
            clearMap();
        }
        _inTransit = true;
        
        //total route planned
        let route = uniqueArray(convertPointsToRoute());
        //starting points, we add points from route to routeTraveled as we travel
        let routeTraveled = [route.shift(), route.shift()];
        //add first point marker
        addMarker(getLocationfromLatLng(routeTraveled[0]));
        
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
        let source = new mapboxgl.GeoJSONSource({ data: data });
        _map.addSource("route", source);
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
        _layers.push("route");
        
        //start the sweet music
        if(document.getElementById("music").checked) {
            _audio.play();
        }

        let counter = 0;
        animate();
        
        //new animate function that uses requestAnimationFrame function
        function animate() {
            let point = route[counter];
            routeTraveled.push(point);
            source.setData(data);                
            _map.setCenter(point);
            
            //if we hit one of our locations, add a dot marker
            let loc = getLocationfromLatLng(point);
            if(loc) {
                addMarker(loc);
            }

            // Request the next frame of animation so long as destination has not
            // been reached.
            if (counter !== route.length -1) {
                requestAnimationFrame(animate);
            } else {
                _inTransit = false;
            }

            counter = counter + 1;
        }
    };

    function getLocationfromLatLng(point) {
        for(let loc of _locations) {
            if(point.toString() === loc.xy.toString()) {
                return loc;
            }
        }
    }
    
    function uniqueArray(a) {
        let seen = {};
        return a.filter((item) => {
            return seen.hasOwnProperty(item) ? false : (seen[item] = true);
        });
    }
    
    //Generator function so we can use for..of and have an index
    function* enumerate(iterable) {
        let i = 0;

        for (const x of iterable) {
            yield [i, x];
            i++;
        }
    }

    return pub;
})(mapboxgl);