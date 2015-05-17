
Template.reports.events({
  'click .morereports': function(evt) {
		newLimit = Session.get('limit') + 10;
		Session.set('limit', newLimit);
  }		
})

Template.scrape.events({
	'click .scrape': function(evt){
		Meteor.call("scrapeReports", function(error, result) {
		});
	}	
})

