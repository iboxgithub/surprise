/**
 * Created by ibox on 20/09/15.
 */

Template.dashboard.events({

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
    estimates: function(){

        var items = Operations.find({owner:Meteor.userId()},{sort:{estimations:{date:-1}}});
        //console.log(JSON.stringify(items, null, 4));
        var list = [];

        items.forEach(function(item){
            //checking if it is useful to display hours or days
            if(item['time_estimated'] / 60 > 1){
                item['min_estimates'] = item['time_estimated'] / 60;
            }
            if(item['time_estimated'] / 3600 > 1){
                item['hours_estimates'] = item['time_estimated'] / 3600;
            }
            if((item['time_estimated'] / 3600) / 24 > 0.5){
                item['days_estimates'] = (item['time_estimated'] / 3600) / 24;
            }
            list.push(item);
        });

        return list;
    },
    random: function(date){
        return new Date(date).getTime();
    },
    files: function () {
        return Files.find();
    }
});