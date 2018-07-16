$( document ).ready(pageReady);

var hhMap;
var hikesLayer;
var visibleStartLayer;
var saveControl;

function pageReady() {
	console.log("page ready");

	hhMap = L.map('mapid')

	//Background tile layer to show loading
	//https://github.com/Leaflet/Leaflet/issues/4866#issuecomment-243485280
	var backgroundTileLayer = L.tileLayer.offline("css/images/repeating-grid.jpg");
	hhMap.addLayer(backgroundTileLayer);

	var osmURL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
	var osmAttr = 'Tiles &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
	var osmLayer = L.tileLayer.offline(osmURL, {
		attribution: osmAttr
	});

	var otmURL = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
	var otmAttr = 'Tiles &copy;m <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)';
	var otmLayer = L.tileLayer.offline(otmURL, {
		maxZoom: 14,
		attribution: otmAttr
	});

	var u4mURL = 'https://tileserver.4umaps.com/{z}/{x}/{y}.png';
	var u4mAttr = 'Tiles &copy;m <a href="https://4umaps.com">4UMaps</a>';
	var u4mLayer = L.tileLayer.offline(u4mURL, {
		attribution: u4mAttr
	});

	var hbmURL = 'http://{s}.tiles.wmflabs.org/hikebike/{z}/{x}/{y}.png';
	var hbmAttr = 'Tiles &copy;m <a href="https://hikebikemap.org">Hike Bike Map and OpenStreetMap</a>';
	var hbmLayer = L.tileLayer.offline(hbmURL, {
		attribution: hbmAttr,
		errorTileUrl: 'data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=='
	});

	var ewiURL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
	var ewiAttr = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
	var ewiLayer = L.tileLayer.offline(ewiURL, {
		attribution: ewiAttr,
		errorTileUrl: 'data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=='
	});
	
	var baseMaps = {
		"OpenStreetMap": osmLayer,
		"OpenTopoMap": otmLayer,
		"4UMaps": u4mLayer,
		'Hike & Bike': hbmLayer,
		'Satellite' : ewiLayer
	}
	

	hhMap.addLayer(osmLayer);
	
	var layersControl = L.control.layers(baseMaps);
	hhMap.addControl(layersControl);

	var scaleControl = L.control.scale()
	hhMap.addControl(scaleControl)

	//Support offline tiles for OSM tiles
	hhMap.on('baselayerchange', function(e) {
		if (e.layer !== osmLayer)
			hhMap.removeControl(saveControl);
		else
			saveControl = addSaveControls(e.layer);
	});
	
	var locateControl = L.control.locate({
		keepCurrentZoomLevel: true,
		returnToPrevBounds: true,
		enableHighAccuracy: true
	});
	hhMap.addControl(locateControl);

	var infoButtonControl = L.control.infoButton({
		title: aboutTitle,
		html: aboutInfo
	})
	hhMap.addControl(infoButtonControl)

	hhMap.setView([37.0902, -95.7129], 4);

	//Create hikes marker layer
	hikesLayer = L.geoJSON(false, {
		pointToLayer: pointToLayer,
		onEachFeature: onEachFeatureMainPoint
	});
	hhMap.addLayer(hikesLayer);


	//Load hikes
	loadItems();
	/*
	$.ajax({
		url: 'https://api.imgur.com/3/album/gNaYZ',
		type: 'GET',
		headers: {
			Authorization: 'Client-ID ' + '7229b40e3a2cd97',
		},
		success: function(result) {
			console.log(result)
		}
	});
	*/
}

function addSaveControls(baseLayer) {
	//add buttons to save tiles in area viewed
	var control = L.control.savetiles(baseLayer, {
    //'zoomlevels': [13,16], //optional zoomlevels to save, default current zoomlevel
    'confirm': function(layer, successcallback) {
    	successcallback();
    	document.getElementById('save-control').disabled = true;
    	document.getElementById('save-control').className = "fa fa-circle-o-notch fa-spin";
    },
    'confirmRemoval': function(layer, successCallback) {
    	successCallback();
    },
    'saveText': '<i class="fa fa-download" id="save-control" aria-hidden="true" title="Save tiles offline"></i><div id="storage-progress" title="Tiles saved"></div>',
    'rmText': '<i class="fa fa-trash" id="remove-control" aria-hidden="true"  title="Remove saved tiles"></i>'
  });
	control.addTo(hhMap);
	var previousStorageSize;
	baseLayer.on('storagesize', function(e) {
		previousStorageSize = e.storagesize
		document.getElementById('storage-progress').textContent = e.storagesize;
	})
  //events while saving a tile layer
  var progress;
  baseLayer.on('savestart', function(e) {
  	progress = 0;
  	document.getElementById("storage-progress").textContent = e.lengthSaved + '/' + e.lengthToBeSaved;
  });
  baseLayer.on('savetileend', function(e) {
  	progress++;
  	document.getElementById("storage-progress").textContent = e.lengthSaved + '/' + e.lengthToBeSaved;
  });
  baseLayer.on('loadend', function(e) {
    //alert("Saved all tiles");
    console.log("Saved all tiles");
    previousStorageSize = e.storagesize
    document.getElementById('storage-progress').textContent = e.storagesize;
    document.getElementById('save-control').disabled = false;
    document.getElementById('save-control').className = "fa fa-download";
  });
  baseLayer.on('tilesremoved', function(e) {
    //alert("Removed all tiles");
    console.log("Removed all tiles");
    previousStorageSize = e.storagesize
    document.getElementById('storage-progress').textContent = e.storagesize;
    document.getElementById('save-control').disabled = false;
    document.getElementById('save-control').className = "fa fa-download";
  });
  return control;
}