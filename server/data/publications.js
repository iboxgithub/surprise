/**
 * Created by ibox on 21/09/15.
 */

//todo: no security here --> publish/subscribe data conditionnally
//security is only via router now

Meteor.publish('operations', function() {
    return Operations.find();
});

Meteor.publish('files', function() {
    return Files.find();
});