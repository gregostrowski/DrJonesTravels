"use strict";var _slicedToArray=function(){function e(e,r){var t=[],n=!0,o=!1,a=void 0;try{for(var i,u=e[Symbol.iterator]();!(n=(i=u.next()).done)&&(t.push(i.value),!r||t.length!==r);n=!0);}catch(c){o=!0,a=c}finally{try{!n&&u["return"]&&u["return"]()}finally{if(o)throw a}}return t}return function(r,t){if(Array.isArray(r))return r;if(Symbol.iterator in Object(r))return e(r,t);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),app=function(e){function r(){e.accessToken="pk.eyJ1Ijoib25ldGhydTIiLCJhIjoiY2lvOWNtMGkxMDMyNHY2a3FpMWZtejRvbCJ9.fvCj4Thw_6POMXE8FoMPWw",h=new e.Map({container:"map",style:"mapbox://styles/onethru2/ciofwmylr003saimaiv2cg5ud",center:[-98,40],zoom:4}),m=new e.Geocoder({flyTo:!1,placeholder:"Add a Location"}),h.addControl(m),m.on("result",o),h.addControl(new e.Navigation)}function t(){w=new Audio("IndianaJones.mp3"),w.volume=.2,$(".play-route").click(function(){s()}),$("#music").on("change",function(e){e.target.checked===!1?w.pause():x&&w.play()})}function n(){var e=!0,r=!1,t=void 0;try{for(var n,o=b[Symbol.iterator]();!(e=(n=o.next()).done);e=!0){var a=n.value;h.removeLayer(a),h.removeSource(a)}}catch(i){r=!0,t=i}finally{try{!e&&o["return"]&&o["return"]()}finally{if(r)throw t}}b=[]}function o(e){e.xy=a(e),g.push(e),g.length>=2&&$(".play-route").prop("disabled",!1),$("#locations").append("<li>"+e.result.text+"</li>"),m._clear()}function a(e){return Array.isArray(e)?e:e.result.geometry.coordinates}function i(e){var r="pt"+e.result.id;h.getSource(r)||(h.addSource(r,{type:"geojson",data:{type:"FeatureCollection",features:[]}}),h.addLayer({id:r,source:r,type:"circle",paint:{"circle-radius":7,"circle-color":"red"}}),h.getSource(r).setData(e.result.geometry),b.push(r))}function u(e,r,t){return e+(r-e)*t}function c(e,r){for(var t=a(e),n=a(r),o=Number((1/S).toFixed(4)),i=o,c=[t],l=0;S>l;l++){var s=[u(t[0],n[0],i),u(t[1],n[1],i)];c.push(s),i+=o}return c.push(n),c}function l(){var e=[],r=!0,t=!1,n=void 0;try{for(var o,a=f(g)[Symbol.iterator]();!(r=(o=a.next()).done);r=!0){var i=_slicedToArray(o.value,2),u=i[0],l=i[1];if(g.length<=u+1)break;e=e.concat(c(l,g[u+1]))}}catch(s){t=!0,n=s}finally{try{!r&&a["return"]&&a["return"]()}finally{if(t)throw n}}return e}function s(){function r(){var e=t[c];o.push(e),u.setData(a),h.setCenter(e);var n=d(e);n&&i(n),c!==t.length-1?requestAnimationFrame(r):x=!1,c+=1}if(!x){h.getLayer("route")&&n(),x=!0;var t=y(l()),o=[t.shift(),t.shift()];i(d(o[0])),h.zoomTo(6),h.setCenter(o[0]);var a={type:"Feature",properties:{},geometry:{type:"LineString",coordinates:o}},u=new e.GeoJSONSource({data:a});h.addSource("route",u),h.addLayer({id:"route",type:"line",source:"route",layout:{"line-join":"round","line-cap":"round"},paint:{"line-color":"red","line-width":6}}),b.push("route"),document.getElementById("music").checked&&w.play();var c=0;r()}}function d(e){var r=!0,t=!1,n=void 0;try{for(var o,a=g[Symbol.iterator]();!(r=(o=a.next()).done);r=!0){var i=o.value;if(e.toString()===i.xy.toString())return i}}catch(u){t=!0,n=u}finally{try{!r&&a["return"]&&a["return"]()}finally{if(t)throw n}}}function y(e){var r={};return e.filter(function(e){return r.hasOwnProperty(e)?!1:r[e]=!0})}function f(e){var r,t,n,o,a,i,u;return regeneratorRuntime.wrap(function(c){for(;;)switch(c.prev=c.next){case 0:r=0,t=!0,n=!1,o=void 0,c.prev=4,a=e[Symbol.iterator]();case 6:if(t=(i=a.next()).done){c.next=14;break}return u=i.value,c.next=10,[r,u];case 10:r++;case 11:t=!0,c.next=6;break;case 14:c.next=20;break;case 16:c.prev=16,c.t0=c["catch"](4),n=!0,o=c.t0;case 20:c.prev=20,c.prev=21,!t&&a["return"]&&a["return"]();case 23:if(c.prev=23,!n){c.next=26;break}throw o;case 26:return c.finish(23);case 27:return c.finish(20);case 28:case"end":return c.stop()}},v[0],this,[[4,16,20,28],[21,,23,27]])}var v=[f].map(regeneratorRuntime.mark),p={},h=void 0,m=void 0,g=[],b=[],w=void 0,x=!1,S=200;return p.init=function(){r(),t()},p}(mapboxgl);