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
                    console.log('estimation. Client Callback ERROR : ' + error.reason);
                    $('#output').val('Hevon API is unreachable, please contact support');
                }
                else {
                    //var time_estimated = result;//JSON.stringify(result, null, 4);
                    console.log('estimation. Client Callback OK : ' + result + ' seconds estimated');

                }
            });
        }
    },
    //to grab all followers of this account
    'submit .process': function(e){
        e.preventDefault();
        //where to download
        var folder = '/home/ibox';//todo prompt('Please indicate your folder path:');
        console.log('process');
        var account = $(e.target).find('[id=account]').val();
        var _id = $(e.target).find('[id=_id]').val();
        var cursor = $(e.target).find('[id=cursor]').val();

        console.log(_id + ' - Processing...' + account);

        var params = {cursor:cursor, account:account, filename:account + '.txt', folder:folder};

        Meteor.call('followers', params, function(error, result) {
            // display the error to the user and abort
            if (error) {
                console.log('followers. Client Callback ERROR : ' + error.reason);
                //$('#output').val('Hevon API is unreachable, please contact support');
            }
            else {
                //var time_estimated = result;//JSON.stringify(result, null, 4);
                console.log('followers. Client Callback OK : Account processed, file available for download');
            }
        });
    }
});

Template.dashboard.helpers({

    //to get previous estimates stored in DB (subscription done via route)
    operations_dashboard_helper: function(){
        return Operations.find({},{});
    },
    random: function(date){
        return new Date(date).getTime();
    },
    /*files: function () {
        return Files.find({"original.name":"followers2.txt"});
    },*/
    fileByAccount: function (account) {
        //console.log('sdfsd ' + account);
        var files = [];
        var file = Files.findOne({"original.name":account + ".txt"});
        if(!file)
            file = {};
        files.push(file);
        return files; //todo: update insert
    },
    status: function () {
        var account = $(e.target).find('[id=account]').val();
        var _id = $(e.target).find('[id=_id]').val();
        var cursor = $(e.target).find('[id=cursor]').val();
        var time_spent = $(e.target).find('[id=time_spent]').val();
        var time_remaining = $(e.target).find('[id=time_remaining]').val();

        if(cursor == -1){
            return 'You never asked to get those followers';
        }
        else if(cursor == 0){
            return 'Followers available for download';
        }
        else{
            //todo: add warning if Time spent is too high regarding estimations
            return 'Last cursor: ' + cursor + ' | Time remaining: ' + time_remaining + ' | Time spent: ' + time_spent;
        }

        //return Files.find({"original.name":"followers2.txt"}); //todo: update insert
    },
    time_converter: function(time){

        return f_time_converter(time);

    },
    time_remaining: function(time_estimated, time_spent){

        var delta = time_estimated - time_spent;
        console.log();
        return f_time_converter(delta);

    }
});

// FUNCTIONS -------------------------
function f_time_converter(time){
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
    else if(!time){
        return 'No time';
    }
    else{
        return time + ' seconds';
    }
}