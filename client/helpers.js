
Template.reports.created = function() {
  Session.setDefault('limit', 10);

  // Deps.autorun() automatically rerun the subscription whenever Session.get('limit') changes
  // http://docs.meteor.com/#deps_autorun
  Deps.autorun(function() {
    Meteor.subscribe('getReports', Session.get('limit'));
  });
}

Template.reports.helpers({
  reports: function() {
	return ReportsList.find({}, {sort: {year: -1, month: -1}, limit: Session.get('limit') });
  }
});

Template.admin.created = function() {
  Deps.autorun(function() {
    Meteor.subscribe('getSiteInfo');
  });
}

Template.admin.helpers({
  scrapingstatus: function() {
	return SiteInfo.findOne({_id:"scrape"},{fields: {'status':1}}).status;
  }
  
});