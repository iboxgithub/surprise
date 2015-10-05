/**
 * Created by ibox on 20/09/15.
 */

//METHODS  ------------------------

Meteor.methods({

    estimate: function(params){
        check(params,Object);

        // 15 iterations every 15 min, 200 results per iteration, 1 session = 15 iterations
        var amount_results = getEstimate(params.account);
        var iterations = amount_results / 200;
        var sessions = iterations / 15; //1 session lasts 15 minutes minimum + 20s as treatment time so 920s
        var time_estimated = sessions * 920;
        var date = new Date().toISOString();

        var estimations = []; //array of estimations

        //brand new estimation
        var estimation = {
            amount:amount_results,
            time_estimated:time_estimated,
            date: date
        };

        //basic item
        var item = {
            owner:params.owner,
            account:params.account
        };

        //we check if we already covered that account
        var item_temp = getAccount(params.account);

        if(item_temp){//we push former and new estimations by merging them
            item_temp.estimations.unshift(estimation); //we add at the beginning of the array (no need to sort later on)
            //we finish the setup of the item
            item.estimations = item_temp.estimations;

        }
        else{//we just push new estimation
            estimations.push(estimation);
            //we finish the setup of the item
            item.estimations = estimations;
        }





        //DB upsert --> regardless if we incremented a new estimation or if it is the first on, we upsert
        Operations.upsert({account:params.account},item,
            function(error,resultId) {
                if (error) {
                    console.log('error : ' + error.reason);
                    //self.response.end(JSON.stringify(msgErrorConnection));
                }
                else {
                    console.log('insert OK: ' + resultId);
                    //var amount_sent = parseFloat(reqBody.amount_from);

                }
            }
        );

        /*Operations.insert(item,
            function(error,resultId) {
                if (error) {
                    console.log('error : ' + error.reason);
                    //self.response.end(JSON.stringify(msgErrorConnection));
                }
                else {
                    console.log('insert OK: ' + resultId);
                    //var amount_sent = parseFloat(reqBody.amount_from);

                }
            }
        );*/

        return time_estimated; //in seconds
    },
    followers: function(params){
        check(params,Object);

        var cursor = -1;//1507591097488349000;//-1;
        var n = 0;//, timeout = 1;

        console.log( 'Start API call' ) ;

        do{
            console.log( 'Loop ' + n ) ;

            if(n % 15 == 0 && n != 0){ //15 iterations par 15 min

                console.log('Sleeping for 15 min (900s)...'); //todo: add estimated time remaining by dividing n
                Meteor.sleep(900000); // ms (froatsnook:sleep package)
                console.log('...Awaken');
            }
            /*else{
                timeout = 1;
            }*/

            cursor = getFollowers(params.account, cursor, params.filename,params.folder);

            n ++;

            console.log('Cursor: ' + cursor);
            //todo insert in DB
        }
        while(cursor != 0);
        //cursor = getFollowers('business', cursor, 'followers');

        console.log( 'END' ) ;
    }

});

// FUNCTIONS -------------------------
function getAccount(screen_name){
    var result = Operations.findOne({account:screen_name});

    return result;
}

function getEstimate(screen_name){

    var Twit = Npm.require('twit');
    var content = [];
    var T = new Twit({
        consumer_key:         'cCbsm31rM8Pdvd5zMBMS3vDbc', // API key
        consumer_secret:      'qy3BNzuU3thNbcAuYuCaHwZGPVXY54CgI0roUU5vhtI3DD4YME', // API secret
        access_token:         '1688390773-SghtLzX7UePTo495FQ6fNVu5c29a5m2RKRDvUq5',
        access_token_secret:  'IWevuIf3QPgFU5YjxcH6ya0uEDcAhDEi7nOj0hQqNUEcE'
    });

    // Set up a future
    Future = Npm.require('fibers/future');
    var future = new Future();
    // A callback so the job can signal completion
    var onComplete = future.resolver();

    T.get('users/show',
        {
            screen_name: screen_name // [Bloomberg Business = @business]
        },
        function(err, data, response) {
            if(err){
                //cursor = 0;
                onComplete(err, data); console.log(err);
                return 0;
            }
            else{
                onComplete(null, data.followers_count);
                //console.log('API call for Followers is OK');
                return data.followers_count;
            }
        }
    );

    return future.wait();
}

function getFollowers(screen_name, cursor, filename, folder){

    var Twit = Npm.require('twit');
    var fs = Npm.require( 'fs' ) ;
    var path = Npm.require( 'path' ) ;
    var content = [];
    var T = new Twit({
        consumer_key:         'cCbsm31rM8Pdvd5zMBMS3vDbc', // API key
        consumer_secret:      'qy3BNzuU3thNbcAuYuCaHwZGPVXY54CgI0roUU5vhtI3DD4YME', // API secret
        access_token:         '1688390773-SghtLzX7UePTo495FQ6fNVu5c29a5m2RKRDvUq5',
        access_token_secret:  'IWevuIf3QPgFU5YjxcH6ya0uEDcAhDEi7nOj0hQqNUEcE'
    });

    // Set up a future
    Future = Npm.require('fibers/future');
    var future = new Future();
    // A callback so the job can signal completion
    var onComplete = future.resolver();

    T.get('followers/list',
        {
            screen_name: screen_name, // [Bloomberg Business = @business]
            cursor: cursor, //1480779301481839900
            count: 200
        },
        function(err, data, response) {
            if(err){
                //cursor = 0;
                onComplete(err, data); console.log(err);
                return 0;
            }
            else{
                //var base = '/home/ibox';//"C:\\Users\\user\\Documents\\dev" ; //fs.realpathSync('.');

                var filePath = path.join(folder, filename + '.txt' ) ;
                console.log('File path: ' + filePath ) ;

                console.log('Current cursor : ' + cursor + ', next cursor : ' + data.next_cursor);
                //cursor = data.next_cursor; //next page

                for(var follower in data.users){
                    //console.log('---------------------------------------');
                    var content = data.users[follower].id_str + '|'
                            + data.users[follower].name + '|'
                            + data.users[follower].screen_name + '|'
                            + data.users[follower].location + "|\n"
                        ;

                    console.log(data.users[follower].name);
                    fs.appendFile(filePath, content, function (err) { //JSON.stringify(data,null,4)
                        if (err) {
                            //cursor = 0;
                            onComplete(err, null);
                            console.log(err);
                            return 0;
                        }
                        //else console.log('OK FS');
                    });
                }
                onComplete(null, data.next_cursor);
                //console.log('API call for Followers is OK');
                return data.next_cursor;
            }
        }
    );

    return future.wait();
}