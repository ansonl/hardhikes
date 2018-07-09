function loadItems() {

	var progress = 0;
	var total = 0;

	$('#statusAlert').show();
	$('#statusProgressBar>div').css('width', progress+'%');

	for (var stateAbbr in statesDict) {
		total++;
	}

	for (var stateAbbr in statesDict) {
		$.ajax({
			dataType: "json",
			url: 'hikes/' + statesDict[stateAbbr].toLowerCase().split(' ').join('-') + '.geojson',
			data: null,
			success: function(data, textStatus, jqXHR) {
				addToMap(data['features'])
			},
			error: function(data, textStatus, jqXHR) {
				//404 means state does not have geojson file for it yet
				//non-404 indicates another error
				if (data.status != 404) {
					console.log(data);
					$('#statusAlertText').text('Loading ' + statesDict[stateAbbr] + ' error: ' + data.status + textStatus);
				}
			},
			complete(jqXHR, textStatus) {
				progress++
				$('#statusProgressBar>div').css('width', (progress/total)*100+'%');

				if (progress == total)
					$('#statusAlert').hide();

			}
		});
	}
}

function addToMap(featureCollection) {
	hikesLayer.addData(featureCollection)
}

//Create marker object with correct look for each geoJsonPoint
function pointToLayer(geoJsonPoint, latlng) {
	console.log(geoJsonPoint)

	var createdMarker = L.marker(latlng); 

	if (geoJsonPoint.properties && geoJsonPoint.properties.type) {
		if (geoJsonPoint.properties.type == 'start') {
			var customIcon = L.divIcon({className: 'trailhead-icon', iconSize: new L.Point(6, 20)})
			createdMarker = L.marker(latlng, {icon: customIcon});
		} else if (geoJsonPoint.properties.type == 'peak') { //peak icon
			var peakClass = 'peak-icon';
			var difficulty = 0; //default difficulty, use .peak-icon
			//Use .peak-icon-X, where X = difficulty [1,5]
			if (geoJsonPoint.properties.difficulty && geoJsonPoint.properties.difficulty > 0 && geoJsonPoint.properties.difficulty <= 5) {
				difficulty = geoJsonPoint.properties.difficulty;
				peakClass = peakClass + ' peak-icon' + (difficulty > 0 ? '-'+difficulty : '')
			}
			var customIcon = L.divIcon({className: peakClass, iconSize: new L.Point(30, 14)})
			createdMarker = L.marker(latlng, {icon: customIcon});
		} else if (geoJsonPoint.properties.type == 'canyon') { //canyon icon
			var peakClass = 'canyon-icon';
			if (geoJsonPoint.properties.difficulty && geoJsonPoint.properties.difficulty > 0 && geoJsonPoint.properties.difficulty <= 5) {
				difficulty = geoJsonPoint.properties.difficulty;
				peakClass = peakClass + ' canyon-icon' + (difficulty > 0 ? '-'+difficulty : '')
			}
			var customIcon = L.divIcon({className: peakClass, iconSize: new L.Point(25, 20)})
			createdMarker = L.marker(latlng, {icon: customIcon});
		} else if (geoJsonPoint.properties.type == 'cave') { //cave icon
			var peakClass = 'cave-icon';
			if (geoJsonPoint.properties.difficulty && geoJsonPoint.properties.difficulty > 0 && geoJsonPoint.properties.difficulty <= 5) {
				difficulty = geoJsonPoint.properties.difficulty;
				peakClass = peakClass + ' cave-icon' + (difficulty > 0 ? '-'+difficulty : '')
			}
			var customIcon = L.divIcon({className: peakClass, iconSize: new L.Point(25, 20)})
			createdMarker = L.marker(latlng, {icon: customIcon});
		} else { //other generic but still specified type icon
			var customIcon = L.divIcon({className: 'generic-icon', iconSize: new L.Point(10, 20)})
			createdMarker = L.marker(latlng, {icon: customIcon});
		}
	}

	var visible = true;
	createdMarker.on('click', function () {
		if (visible) {
			createdMarker.setOpacity(0.5);
		} else {
			createdMarker.setOpacity(1);
		}
		visible = !visible;
	});

	//Set tooltip with name
	if (geoJsonPoint.properties && geoJsonPoint.properties.name) {
		var tooltipText = geoJsonPoint.properties.name;

		if (geoJsonPoint.properties.type && geoJsonPoint.properties.type == 'start') {
			tooltipText = 'START' + (tooltipText.length > 0 ? ' - ' + tooltipText : '');
		}

		createdMarker.bindTooltip(tooltipText, {
			sticky: true,
			direction: 'bottom'
		})
	}

	//Set popup with popupContent text
	var popupText = '';
	if (geoJsonPoint.properties && geoJsonPoint.properties.popupContent) {
		popupText = geoJsonPoint.properties.popupContent
	}

	if (geoJsonPoint.properties && geoJsonPoint.properties.involves && geoJsonPoint.properties.involves.length > 0) {
		popupText += (popupText.length > 0 ? '</br>' : '') + '<strong>Involves:</strong><ul>';
		for (var i = 0; i < geoJsonPoint.properties.involves.length; i++) {
			popupText += '<li>' + geoJsonPoint.properties.involves[i] + '</li>'
		}
		popupText += '</ul>'
	}

	if (popupText.length > 0) {
		createdMarker.bindPopup(popupText);
	}

	return createdMarker;
	
}

//Create correct tooltip for subpoint
function onEachFeatureSubPoint(feature, layer) {
	
}

function onEachFeatureMainPoint(feature, layer) {
		//Create subPoint layer for subfeatures
		//Show subPoint layer when parent marker selected
		if (feature.properties && feature.properties.subFeatures) {
			var subPointsLayer = L.geoJSON(false, {
				pointToLayer: pointToLayer,
				onEachFeature: onEachFeatureSubPoint
			})
			subPointsLayer.addData(feature.properties.subFeatures)

			layer.on('click', function() {
				if (visibleStartLayer)
					hhMap.removeLayer(visibleStartLayer);
				visibleStartLayer = subPointsLayer
				hhMap.addLayer(visibleStartLayer);
			})
		}
	}