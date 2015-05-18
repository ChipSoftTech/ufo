Meteor.publish('Info', function() {
  return Info.find();
});

Meteor.publish('sightings', function(limit) {
  if (limit > Sightings.find().count()) {
    limit = 0;
  }

  return Sightings.find({}, {sort: {date: -1}, limit: limit });
});

