
Template.home.events({
  'click .moresightings': function(evt) {
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

