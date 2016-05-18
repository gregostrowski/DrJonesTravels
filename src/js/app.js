let app = (function (mapboxgl) {
    let pub = {},
        _map,
        _geocoder,
        _locations = [], //array to keep our destination locations
        _audio,
        _inTransit = false, //are we flying?
        _stepsBetweenPoints = 25, //# of points we'll add between locations
        _timeBetweenSteps = 50; //how quickly we fly

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
            style: 'mapbox://styles/mapbox/bright-v9', //stylesheet location
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

    //capture geocode callback, add object to locations
    function geoQueryCallback(result) {
        _locations.push(result);
        if(_locations.length >= 2) {
            $(".play-route").prop('disabled', false);
        }
        
        //add new list item on UI
        $("#locations").append("<li>" + result.result.text + "</li>");
        
        //clear geocoder text of previous search
        _geocoder._clear();
    }

    //get the Lat/Lng from a geocode object
    function getLatLngFromPoint(point) {
        return [point.result.center[0], point.result.center[1]];
    }

    //Generates array of points that create a line between two points
    // param: a => starting point
    // param: b => ending point
    // param: stepCount => number of points in line
    function getLineFromPoints(a, b, stepCount) {
        const aLL = getLatLngFromPoint(a);
        const bLL = getLatLngFromPoint(b);
        let line = [aLL]; //add first point
        
        
        let stepPerc = Number((1 / stepCount).toFixed(4)); //The progress. It is given in percentage, between 0 and 1.
        let stepIter = stepPerc;
        for(let i = 0; i < stepCount; i++) {
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
                route = route.concat(getLineFromPoints(obj, _locations[i + 1], _stepsBetweenPoints));
                if(i+1 < _locations.length && _locations.length > 2) {
                    route.pop(); //get rid of duplicates if we're creating a+b, b+c, we'll have 2 'b' points
                }
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
            _map.removeLayer("route");
            _map.removeSource("route");
        }
        _inTransit = true;
        
        //total route planned
        let route = convertPointsToRoute();
        //starting points, we add points from route to routeTraveled as we travel
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
        let source = new mapboxgl.GeoJSONSource({ data: data });
        _map.addSource("route", source);
        
        //start the sweet music
        if(document.getElementById("music").checked) {
            _audio.play();
        }
        
        //add the points in the route
        for (const [i, point] of enumerate(route)) {
            //add delay to mimic the flying animation
            setTimeout(function () {
                routeTraveled.push(point);
                source.setData(data);                
                _map.setCenter(point);
                if(i === route.length -1) {
                    _inTransit = false;
                }
            }, _timeBetweenSteps + i * 180);
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
    
    //Linear Interpolation for finding points on a line
    function linearInterpolation(start, end, percentage) {
        return start + (end - start) * percentage;
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