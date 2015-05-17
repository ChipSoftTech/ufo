
Meteor.publish('getReports', function(limit) {
  if (limit > ReportsList.find().count()) {
    limit = 0;
  }

  return ReportsList.find({}, {sort: {year: -1, month: -1}, limit: limit });
});

Meteor.publish('getSiteInfo', function() {
  return SiteInfo.find();
});




