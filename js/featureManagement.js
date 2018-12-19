var testglob;

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

	//Set popup with popupContent
	var popupDiv;

	if (geoJsonPoint.properties && geoJsonPoint.properties.name && geoJsonPoint.properties.name.length > 0) {
		if (!popupDiv)
			popupDiv = L.DomUtil.create('div');

		//Create title from name
			$(popupDiv).append($('<h3/>', {'class': 'popupTitle'}).text(geoJsonPoint.properties.name));
	}


	if (geoJsonPoint.properties && geoJsonPoint.properties.popupContent) {
		if (!popupDiv)
			popupDiv = L.DomUtil.create('div');

		//Create description from popupContent
		var desc = L.DomUtil.create('p', null, popupDiv);
		desc.innerHTML = geoJsonPoint.properties.popupContent
	}

	//Create elevation, gain, distance list from elevation/gain/distance
	if (geoJsonPoint.properties && geoJsonPoint.properties.elevation) {
		if (!popupDiv)
			popupDiv = L.DomUtil.create('div');

		var listDiv = L.DomUtil.create('div', null, popupDiv)
		L.DomUtil.create('strong', null, listDiv).textContent = 'Elevation:';
		L.DomUtil.create('span', null, listDiv).textContent = geoJsonPoint.properties.elevation;
	}
	if (geoJsonPoint.properties && geoJsonPoint.properties.gain) {
		if (!popupDiv)
			popupDiv = L.DomUtil.create('div');

		var listDiv = L.DomUtil.create('div', null, popupDiv)
		L.DomUtil.create('strong', null, listDiv).textContent = 'Gain:';
		L.DomUtil.create('span', null, listDiv).textContent = geoJsonPoint.properties.gain;
	}
	if (geoJsonPoint.properties && geoJsonPoint.properties.distance) {
		if (!popupDiv)
			popupDiv = L.DomUtil.create('div');

		var listDiv = L.DomUtil.create('div', null, popupDiv)
		L.DomUtil.create('strong', null, listDiv).textContent = 'Distance:';
		L.DomUtil.create('span', null, listDiv).textContent = geoJsonPoint.properties.distance;
	}

	//Create involves list from involves[]
	if (geoJsonPoint.properties && geoJsonPoint.properties.involves && geoJsonPoint.properties.involves.length > 0) {
		if (!popupDiv)
			popupDiv = L.DomUtil.create('div');

		var listDiv = L.DomUtil.create('div', null, popupDiv)
		L.DomUtil.create('strong', null, listDiv).textContent = 'Involves:';

		var involvesList = L.DomUtil.create('ul', null, listDiv);
		for (var i = 0; i < geoJsonPoint.properties.involves.length; i++) {
			L.DomUtil.create('li', null, involvesList).textContent = geoJsonPoint.properties.involves[i]
		}
	}

	//popupText += '</br><blockquote class="imgur-embed-pub" lang="en" data-id="a/gNaYZ" data-context="false"><a href="//imgur.com/gNaYZ">FEMA location</a></blockquote>'

	var markerMousedOver = false;
	//Create popup only if we have content for it
	if (popupDiv) {
		var popUp = L.popup( {
			maxWidth: "auto"
			//maxHeight broken because it only determines scroll bars at dom creation time, not taking into account loaded image height
		}).setContent(popupDiv)

		createdMarker.bindPopup(popUp);

		createdMarker.on('popupopen', function(e) {
			
			//Check if there is an album associated with this location properties
			if (!geoJsonPoint.properties || !geoJsonPoint.properties.albumHash || !geoJsonPoint.properties.albumHash.length > 0)
				return;

			if (markerMousedOver)
				return;
			markerMousedOver = true;

			//<i class="fa fa-download" id="save-control" aria-hidden="true" title="Save tiles offline"></i>
			var loadingPicturesArea = $('<div/>')
			loadingPicturesArea.append($('<p/>').text(' Fetching album').prepend($('<i/>', { 'class':'fa fa-circle-o-notch fa-spin', 'title':'Fetching album'})))
			$(popupDiv).append(loadingPicturesArea);

			

			var albumInfo = $.ajax({
				url: 'https://api.imgur.com/3/album/' + geoJsonPoint.properties.albumHash,
				headers: { Authorization: 'Client-ID ' + '7229b40e3a2cd97'},
				type: 'GET',
				dataType: 'json'
			});

			albumInfo.done(function(data) {
				loadingPicturesArea.remove()

				console.log(data);
				
				if (data.data && data.data.images) {
					//$('<div/>', { 'class':'container-fluid' })
					var row = $('<div/>', { 'class':'photosArea' })
					$(popupDiv).append(row);
	
					for (var i = 0; i < data.data.images.length && i < 4; i++) { (function(index){
						var imageObj = data.data.images[i];

						var imageLink = imageObj.link;
						var extensionIndex = imageLink.lastIndexOf('.');
						var squareImageLink = imageLink.slice(0, extensionIndex) + 's' + imageLink.slice(extensionIndex);

						var loadingElement = $('<i/>', { 'class':'fa fa-circle-o-notch fa-spin', 'title':'Fetching picture'});
						var imageElement = $('<img/>', { 'class':'photoElement' });

						//Create function now to make closure
						var bindCall = function() {
							console.log(index);
							loadingElement.hide();
							popUp.update() //adjust popup bounds and offset when image is done loading
						}

						//pass create function, or else bind will call the function at runtime and get the final variable values
						imageElement.bind("load", bindCall)


						var imageArea = $('<div/>', { 'class':'photoSquare' });
						var imageAnchor = $('<a/>').attr({'href': data.data.link}).append(imageArea);

						imageArea.append(imageElement);
						imageArea.append(loadingElement);
						row.append(imageAnchor);

						imageElement.attr({'src': squareImageLink, 'alt': ''})
					
					})(i);
					}
						

					var buttonText = 'View all ' + data.data.images.length;
						buttonText += ' Pictures'

					var albumButton = $('<button/>', { 'type':'button', 'class':'btn btn-success' }).text(buttonText);
					
					//var buttonSquare = $('<div/>', { 'class':'buttonSquare' }).append(albumButton);
					var buttonAnchor = $('<a/>', { 'class':'buttonAnchor' }).attr({'href': data.data.link}).append(albumButton);
					$(popupDiv).append(buttonAnchor);
					
				}
			});

			albumInfo.fail(function(data) {
				console.log(data)
				loadingPicturesArea.text(data);
			});

		});
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