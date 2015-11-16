/**
 * Created by ibox on 20/09/15.
 */

Template.dashboard.events({

    //to estimate how long it would take to grab followers of this account
    'submit .estimation': function (e) {
        e.preventDefault();
        console.log('estimation');
        var account = $(e.target).find('[id=twitter_account]').val();

        if(!account){
            alert('Please give an account in order to proceed...')
        }
        else{
            var params={
                account:account,
                owner:Meteor.userId()
            };
            Meteor.call('estimate', params, function(error, result) {
                // display the error to the user and abort
                if (error) {
                    console.log('Client Callback ERROR : ' + error.reason);
                    $('#output').val('Hevon API is unreachable, please contact support');
                }
                else {
                    //var time_estimated = result;//JSON.stringify(result, null, 4);
                    console.log('Client Callback OK : ' + result + ' seconds estimated');

                }
            });
        }
    },
    //to grab all followers of this account
    'submit .process': function(e){
        e.preventDefault();
        var folder = '/home/ibox';//prompt('Please indicate your folder path:');
        console.log('process');
        var account = $(e.target).find('[id=account]').val();
        var _id = $(e.target).find('[id=_id]').val();

        console.log(_id + ' - Processing...' + account);

        var params = {account:account, filename:'followers', folder:folder};

        Meteor.call('followers', params, function(error, result) {
            // display the error to the user and abort
            if (error) {
                console.log('Client Callback ERROR : ' + error.reason);
                //$('#output').val('Hevon API is unreachable, please contact support');
            }
            else {
                //var time_estimated = result;//JSON.stringify(result, null, 4);
                console.log('Client Callback OK : ' + result + ' seconds estimated');
            }
        });
    }
});

Template.dashboard.helpers({

    //to get previous estimates stored in DB (subscription done via route)
    operations_dashboard_helper: function(){
        return Operations.find({},{sort:{estimations:{date:-1}}});//todo: sort doesnt work
    },
    random: function(date){
        return new Date(date).getTime();
    },
    files: function () {
        return Files.find();
    },
    time_converter: function(time){

        var duration = '';
        if((time / 3600) / 24 > 0.5){//days
            return ((time / 3600) / 24).toFixed(1) + ' days';
        }
        else if((time / 3600) > 1){//hours
            //if(duration == ''){duration += (time / 3600).toFixed(1) + ' hours'}
            //else{
            return (time / 3600).toFixed(1) + ' hours';
        }
        else if(time / 60 > 1){//min
            //if(duration == ''){duration += (time / 60) + ' minutes'}
            //else{
            return (time / 60).toFixed(1) + ' minutes';
        }
        else{
            return time + ' seconds';
        }
    }
});