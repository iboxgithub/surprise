/**
 * Created by ibox on 21/09/15.
 */
Meteor.publish('operations', function() {
    return Operations.find();
});