var statesDict = JSON.parse('{"AL":"Alabama","AK":"Alaska","AS":"American Samoa","AZ":"Arizona","AR":"Arkansas","CA":"California","CO":"Colorado","CT":"Connecticut","DE":"Delaware","DC":"District Of Columbia","FM":"Federated States Of Micronesia","FL":"Florida","GA":"Georgia","GU":"Guam","HI":"Hawaii","ID":"Idaho","IL":"Illinois","IN":"Indiana","IA":"Iowa","KS":"Kansas","KY":"Kentucky","LA":"Louisiana","ME":"Maine","MH":"Marshall Islands","MD":"Maryland","MA":"Massachusetts","MI":"Michigan","MN":"Minnesota","MS":"Mississippi","MO":"Missouri","MT":"Montana","NE":"Nebraska","NV":"Nevada","NH":"New Hampshire","NJ":"New Jersey","NM":"New Mexico","NY":"New York","NC":"North Carolina","ND":"North Dakota","MP":"Northern Mariana Islands","OH":"Ohio","OK":"Oklahoma","OR":"Oregon","PW":"Palau","PA":"Pennsylvania","PR":"Puerto Rico","RI":"Rhode Island","SC":"South Carolina","SD":"South Dakota","TN":"Tennessee","TX":"Texas","UT":"Utah","VT":"Vermont","VI":"Virgin Islands","VA":"Virginia","WA":"Washington","WV":"West Virginia","WI":"Wisconsin","WY":"Wyoming"}')

var aboutInfo = `A map of hikes that I have done that are at least one of the following: 
<ul>
<li>Steep <i>mostly &ge;700ft/1mi gain</i></li>
<li>Difficult somehow (specified for certain hikes)</li>
<li>Fun enough to be worth your time if in the area</li>
</ul>

Map usage info:
<ul>
<li>Markers represent hikes.</li>
<li>Markers for peaks are colored by difficulty. <span style="color: #2ecc71">Green</span> &rarr; Easier. <span style="color: #e74c3c">Red</span> &rarr; Harder <i>(does not necessarily mean more fun)</i></li>
<li>Clicking and hovering on a marker reveals trailheads (entry points) and related features for a hike. <i>Markers are placed so that you can use the locations as is for navigation.</i></li>
<li>No trailhead marker indicates that the hike marker is likely already at the trailhead.</li>
<li>Cache the currently displayed map for offline viewing using the download control on the map left hand side.</li>
<li>More information on a hike can usually be found by searching the trail name.</li>
<li>GPX route will be displayed if I recorded one.</li>
<li>Hikes are continually added to the map as I travel.</li>
</ul>

Please use common sense when hiking.
`