
Template.home.created = function() {
  Session.setDefault('limit', 10);

  // Deps.autorun() automatically rerun the subscription whenever Session.get('limit') changes
  // http://docs.meteor.com/#deps_autorun
  Deps.autorun(function() {
    Meteor.subscribe('sightings', Session.get('limit'));
  }); 
}

Template.scrape.created = function() {
  Deps.autorun(function() {
    Meteor.subscribe('Info');
  });
}

Template.scrape.helpers({
  scrapingstatus: function() {
	var cache = Info.findOne({_id:"scrape"},{fields: {'status':1}});
	
	if(cache) {
		cache = cache.status;
	} else {
		cache = "";
	}
	
	return cache;
  }
  
});
