var request = Meteor.npmRequire('request');
var cheerio = Meteor.npmRequire('cheerio');

Meteor.startup(function () {
	ReportsList._ensureIndex({
		"year" : -1,
		"month" : -1
	});
});

function scrapeIt(error, response, html) {
		console.log("start scrapeReports");
		
		if (!error && response.statusCode == 200) {
			var $ = cheerio.load(html);
			$('table > tbody > tr').each(function(i, element){
				
			  var data = $(this).text().trim().split("\n");
			  var dates = data[0].split("/");
			  var month = dates[0];
			  var year = dates[1];
			  var count = data[1]; 
			  
			  var doc = ReportsList.findOne(month+year);
			  
			  if(doc) {
				if(count != doc.count) {				
					ReportsList.insert({_id:month+year,month:month,year:year,count:count,update:1});
				}
			  }  else {
				ReportsList.insert({_id:month+year,month:month,year:year,count:count,update:0});
			  }
			  
			});
		}
		
		SiteInfo.upsert( "scrape", {status:"Scraping Completed"} );
		console.log("done scrapeReports")		
}

Meteor.methods({
	"scrapeReports" : function () {
		SiteInfo.upsert( "scrape", {status:"Scraping Started"} );
		request('http://www.nuforc.org/webreports/ndxevent.html', Meteor.bindEnvironment(scrapeIt));
	}
});	




