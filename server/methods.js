var request = Meteor.npmRequire('request');
var cheerio = Meteor.npmRequire('cheerio');

Meteor.startup(function () {
	Sightings._ensureIndex({
		"date" : -1
	});
});

function scrapeDetails(error, response, html) {
	if (!error && response.statusCode == 200) {
		var $ = cheerio.load(html, {normalizeWhitespace: false, xmlMode: false, decodeEntities: true});
		var params = [ response.request.headers.parent ];
		
		$('table > tbody > tr').each(function(i, element){
			try {			
				var	pat = /href=.*.html/;
				var summaryref = pat.exec($(this).toString());
				if(summaryref) {
					summaryref = summaryref[0].replace(/href="/ig,'');
				}
				
				var data = $(this).text().trim().split("\n");
				var datetime = 	(typeof data[0] === "undefined" ? '' : data[0].split(" "));
				var date = 		(typeof datetime[0] === "undefined" ? '' : datetime[0].trim());
				var time = 		(typeof datetime[1] === "undefined" ? '' : datetime[1].trim());
				var city = 		(typeof data[1] === "undefined" ? '' : data[1].trim());
				var state = 	(typeof data[2] === "undefined" ? '' : data[2].trim());
				var shape = 	(typeof data[3] === "undefined" ? '' : data[3].trim());
				var duration = 	(typeof data[4] === "undefined" ? '' : data[4].trim());
				var summary = 	(typeof data[5] === "undefined" ? '' : data[5].trim());
				var posted = 	(typeof data[6] === "undefined" ? '' : data[6].trim());
				
				//backfill the long/lat/zip
				var geo = {};
				var zip = "";

				try {
					var lookup = Zipcodes.lookupByName(city, state);
					
					if(lookup.length != 0)
					{
						//Always list coordinates in longitude, latitude order.  Cities have multiple - pick 1st.
						geo = { type: "Point", coordinates: [ lookup[0].longitude, lookup[0].latitude ] };
						zip = lookup[0].zip;
					}	
				} catch(err) {
						//continue
				}					

				Sightings.insert(
				{	
					parent: params[0],
					date: date, 
					time: time, 
					city: city, 
					state: state,
					zip: zip,
					geo: geo,
					shape: shape, 
					duration: duration,
					summary: summary,
					summaryref: summaryref,
					posted: posted
				});
			} catch(err) {
				console.log("bad table row");				
				BadData.insert({raw:data, err: err.toString() });			
			}		
		}, params);
		
	} else {
		console.log("bad detail page");
	}	
}

function scrapeReports(error, response, html) {
		console.log("start scrapeReports");
		
		if (!error && response.statusCode == 200) {
			var $ = cheerio.load(html);
			$('table > tbody > tr').each(function(i, element){
			  var data = $(this).text().trim().split("\n");
			  var postdate = data[0];
			  var dateArray = postdate.split("/");
			  var month = dateArray[0].trim();
			  var day = dateArray[1].trim();
			  var year = dateArray[2].trim(); 
			  var count = data[1].trim(); 
			  
			  var posted = parseInt(month) + "/" + parseInt(day) + "/" + year.slice(-2);
			  var countServer = Sightings.find({posted:posted}).count();

			  Info.upsert( "scrape", {status:"Scraping Details: " + postdate} );
			  
			  if(count > countServer +1) { //many source counts must include header
			  	//to avoid doing denial of service dos, sleep for few
				Meteor._sleepForMs(2000);	
			  
				//	http://www.nuforc.org/webreports/ndxp150513.html
				var targeturl = siteroot + "/" + sitedetails + year.slice(-2) + month + day + ".html";
				
				console.log("targeturl: " + targeturl);
				
				var options = {
				  url: targeturl,
				  headers: {
					'parent': postdate
				  }
				};
				
				//remove all to resync
				Sightings.remove({posted:posted});
				
				request(options, Meteor.bindEnvironment(scrapeDetails));
			  } 
			});
		}
		
		Info.upsert( "scrape", {status:"Scraping Done"} );	
		console.log("done scrapeReports")		
}

Meteor.methods({
	"scrapeReports" : function () {
		Info.upsert( "scrape", {status:"Scraping Started"} );
		request(siteroot + "/" + sitepage, Meteor.bindEnvironment(scrapeReports));
	}
});	




