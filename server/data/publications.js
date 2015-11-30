/**
 * Created by ibox on 21/09/15.
 */

//todo: no security here --> publish/subscribe data conditionnally
//security is only via router now

Meteor.publish('operations', function() {
    return Operations.find();
});

Meteor.publish('cloud', function() {
    return Cloud.find();
});

Meteor.publish('operations_dashboard', function() {
    //console.log(Meteor.userId()); //
    return Operations.find({owner:this.userId},{/*sort:{estimations:{date:-1}}*/}, {id: -1, estimations: 1});
});

Meteor.publish('files', function() {
    return Files.find();
});