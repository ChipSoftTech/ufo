var request = Meteor.npmRequire('request');
var cheerio = Meteor.npmRequire('cheerio');

Meteor.startup(function () {
	ReportsList._ensureIndex({
		"year" : -1,
		"month" : -1
	});
});

function scrapeDetails(error, response, html) {
	if (!error && response.statusCode == 200) {
		var $ = cheerio.load(html, 
		{
			normalizeWhitespace: false,
			xmlMode: false,
			decodeEntities: true
		});
		
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

				ReportsDetails.insert(
				{	
					report: params[0],
					date: date, 
					time: time, 
					city: city, 
					state: state, 
					shape: shape, 
					duration: duration,
					summary: summary,
					summaryref: summaryref,
					posted: posted
				});
			}
			catch(err) {
				console.log("bad table row");				
				BadData.insert({raw:data, err: err.toString() });			
			}		
		}, params);
		
		ReportsList.update(params[0], {
		  $set: {scraped: 1}
		});
		
		
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
			  var dates = data[0].split("/");
			  var month = dates[0].trim();
			  var year = dates[1].trim(); 
			  var count = data[1].trim(); 
			  var id = year + month;
			  
			  var doc = ReportsList.findOne(id);
			  
			  if(doc) {
				if(count != doc.count) {				
					ReportsList.upsert(id,{count:count,scraped:0});
				}
			  }  else {
				ReportsList.insert({_id:id,month:month,year:year,count:count,scraped:0});
			  }
			  
			});
		}
		
		SiteInfo.upsert( "scrape", {status:"Scraping Details"} );

		//loop over reports that require details to be scraped
		ReportsList.find({scraped:0},{sort: {year: -1, month: -1}}
		).forEach(function(obj){
			console.log("Scraping " + obj._id);
			SiteInfo.upsert( "scrape", {status:"Scraping: " + obj._id} );

			//	http://www.nuforc.org/webreports/ndxe201505.html
			var targeturl = siteroot + "/" + sitereportdetails + obj._id + ".html";
			
			console.log("targeturl: " + targeturl);
			
			var options = {
			  url: targeturl,
			  headers: {
				'parent': obj._id
			  }
			};	
			
			
			request(options, Meteor.bindEnvironment(scrapeDetails));
			
			//to avoid doing denial of service dos, sleep for few
			Meteor._sleepForMs(2000);	
		})

		SiteInfo.upsert( "scrape", {status:"Scraping Done"} );	
		console.log("done scrapeReports")		
}

Meteor.methods({
	"scrapeReports" : function () {
		SiteInfo.upsert( "scrape", {status:"Scraping Started"} );
		request(siteroot + "/" + sitereports, Meteor.bindEnvironment(scrapeReports));
	}
});	




