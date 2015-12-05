/**
 * Created by ibox on 20/09/15.
 */

//METHODS  ------------------------

Meteor.methods({

    estimate: function(params){
        check(params,Object);

        // 15 iterations every 15 min, 200 results per iteration, 1 session = 15 iterations = 3000 results
        //knowing that 1 iteration ~ 10 seconds
        var time_estimated = 0, sessions = 0, out_session_iterations = 0;
        var amount_results = getEstimate(params.account);
        var iterations = amount_results / 200; //e.g. for 6000 results we have 30 iterations

        if(iterations < 15) {
            sessions = 0;
            out_session_iterations = iterations;
        }
        else {
            sessions = iterations / 15;// - 1; //...e.g. we would need 30/15 = 2 sessions for 6000 results - 1 session that is not complete (we dont need to wait 15 min because of Twitter API)
            out_session_iterations = iterations % 15;
        }
        //sessions = iterations / 15;// - 1; //...e.g. we would need 30/15 = 2 sessions for 6000 results - 1 session that is not complete (we dont need to wait 15 min because of Twitter API)
        //if(sessions < 0)
            //sessions = 0;//we never go negative
        //else
            //time_estimated += 900; //for the session we removed during the session calcul
        //out_session_iterations = iterations % 15;// so 0 in our case --> 15 iterations out of session
        if(out_session_iterations == 0) {
            out_session_iterations = 15;
            sessions -= 1;//in this case we remove one session
        }
        //1 session lasts 15 minutes minimum + 20s as treatment time so 920s to get 3000 results
        time_estimated = sessions * 920;//...so 920 seconds for 6000 results...
        time_estimated += out_session_iterations * 5; //1 iteration ~ 5 seconds
        time_estimated = time_estimated.toFixed(1);
        // --> around 15 min for sure and
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
            account:params.account,
            cursor:-1,
            archives:[]
        };

        //we check if we already covered that account
        var item_previous = getAccount(params.account);

        if(item_previous){//we push former and new estimations by merging them
            /*item_temp.estimations.unshift(estimation); //we add at the beginning of the array (no need to sort later on)
            //we finish the setup of the item
            item.estimations = item_temp.estimations;*/

            //we get previous archives and we add the last one
            if(!item_previous.archives){//first archiving
                item_previous.archives = [];
                item_previous.archives.push(item_previous.estimation);
            }else{
                item_previous.archives.unshift(item_previous.estimation);
            }
            //we have now up to date archives
            item.archives = item_previous.archives;//there is always only one estimation

            //we replace the previous estimation with the new up to date estimation
            item.estimation = estimation;

        }
        else{//we just push new estimation
            //estimations.push(estimation);
            //we finish the setup of the item
            item.estimation = estimation;
        }

        //DB upsert --> regardless if we incremented a new estimation or if it is the first on, we upsert
        Operations.upsert({account:params.account},item,
            function(error,resultId) {
                if (error) {
                    console.log('error : ' + error.reason);
                    //self.response.end(JSON.stringify(msgErrorConnection));
                }
                else {
                    console.log('insert OK: ' + params.account);
                    //var amount_sent = parseFloat(reqBody.amount_from);

                }
            }
        );

        return time_estimated; //in seconds
    },
    followers: function(params){
        check(params,Object);

        var fs = Npm.require('fs');
        var path = Npm.require('path');
        var cursor = params.cursor;//1507591097488349000;//-1;
        var n = 0;//, timeout = 1;
        var t0 = Date.now();


        //todo: update Operations with process request
        console.log( 'Start API call' ) ;

        //we reset previous processing data (followers_stored...)
        Operations.update({account: params.account},
            {
                $set:{followers_stored: 0, time_spent:0}
            }, function (err, result) {
                console.log('Previous processing reseted');
            });

        //we update the cloud watchdog
        Cloud.upsert({api: 'twitter'},
            {
                $set:{used: true}
            },
            function (err, fileObj) {
                console.log('Cloud Start update: done');
            });

        do{
            console.log('Session ' + n );

            /*if(n % 15 == 0 && n != 0){ //1 session = 15 iterations (per 15 min)

                console.log('Sleeping for 15 min (900s)...'); //todo: add estimated time remaining by dividing n
                //todo: insert remaining time + last cursor to continue treatment in case of failure
                var tx = Date.now();
                var time_spent = (tx.getTime() - t0.getTime()) * 1000; //because getTime is in milliseconds
                //to update operations with last session cursor todo + time remaining
                Operations.update({account: params.account},
                    {
                        $set:{cursor: cursor, time_spent:time_spent},
                        $inc:{followers_stored: n * 200} //todo: maybe 200 to add
                    },
                    function (err, fileObj) {
                    console.log('Last session cursor updated in Operations: ' + cursor);
                });
                Meteor.sleep(900000); // ms (froatsnook:sleep package)
                console.log('...Awaken');
            }*/

            try{
                cursor = getFollowers(params.account, cursor, params.filename, params.folder);
                var nb = 0; //nb followers
                if(cursor == 0){
                    nb = parseInt(params.amount_followers); //last iteration so followers stored is at max
                    //###### to update operations with last session cursor
                    Operations.update({account: params.account},
                        {
                            $set:{cursor: cursor, followers_stored: nb}//we dont increment anymore cause it is the last iteration
                        },
                        function (err, fileObj) {
                            console.log('Last session cursor updated in Operations: ' + cursor);
                        });
                }
                else{
                    //###### to update operations with last session cursor
                    Operations.update({account: params.account},
                        {
                            $set:{cursor: cursor},//we dont increment anymore cause it is the last iteration
                            $inc:{followers_stored: 200}
                        },
                        function (err, fileObj) {
                            console.log('Last session cursor updated in Operations: ' + cursor);
                        });
                }

                //###### we update Cloud in order to be aware how much the API is requested (even without breaching limit --> concurent accesses)
                Cloud.upsert({api: 'twitter'},
                    {
                        $set:{date_last_call: Date.now()},
                        $inc:{calls_used: 1}
                    },
                    function (err, fileObj) {
                        console.log('Cloud iteration update: done');
                    });
            }
            catch(e){
                console.log('API limit detected, last cursor: ' + cursor);
                //console.log(e.stack);
                console.log(JSON.stringify(e,null,4));//JSON.stringify(data,null,4)

                //NOTE PERSO: cursor useless already done in last iteration, time spent to calculate dyna on GUI with followers_stored, followers_stored idem cursor)
                //console.log('Operations update: cursor, time_spent and followers_stored');
                //todo: insert remaining time + last cursor to continue treatment in case of failure
                //var tx = Date.now();
                //var time_spent = (tx.getTime() - t0.getTime()) * 1000; //because getTime is in milliseconds

                //###### to update operations with last session cursor todo + time remaining
                /*Operations.update({account: params.account},
                    {
                        $set:{cursor: cursor, time_spent:time_spent},
                        $inc:{followers_stored: n * 200} //todo: maybe 200 to ad, normally no
                    },
                    function (err, fileObj) {
                        console.log('Last session cursor updated in Operations: ' + cursor);
                    });*/

                //###### to follow API status
                console.log('Cloud API limit start update:date_last_limit, calls_used');
                Cloud.upsert({api: 'twitter'},
                    {
                        $set:{date_last_limit: Date.now(), calls_used: 15}
                        //,                        $inc:{calls_used: n} //todo: maybe 200 to ad, normally no
                    },
                    function (err, fileObj) {
                        console.log('Cloud API limit update: done');
                    });

                console.log('Sleeping for 15 min (900s)...');
                Meteor.sleep(900000); // ms (froatsnook:sleep package)
                //###### to follow API status
                console.log('Cloud API limit end update:date_last_limit, date_last_call, calls_used');
                Cloud.upsert({api: 'twitter'},
                    {
                        $set:{date_last_limit: 0, date_last_call: 0, calls_used: 0}
                        //,                        $inc:{calls_used: n} //todo: maybe 200 to ad, normally no
                    },
                    function (err, fileObj) {
                        console.log('Cloud API limit update: done');
                    });
                console.log('...Awaken');
            }


            n ++;

            console.log('Last iteration cursor: ' + cursor);
        }
        while(cursor != 0);

        var tempFile = params.account + ".txt";
        var previousFile = Files.findOne({"original.name":tempFile});//todo: find how to update a Files doc to add copies

        if(previousFile) //to remove previous file generated todo: enhancement to keep in history? or at least to know the delta? like Git
            Files.remove({_id:previousFile._id});
        else
            console.log('No match for ' + tempFile);

        //once we are sure potential previous file has been deleted we can insert (todo: historization)
        var filePath = path.join(params.folder, params.filename);
        //to index file generated
        Files.insert(filePath, function (err, fileObj) {
            //Inserted new doc with ID fileObj._id, and kicked off the data upload using HTTP
            console.log('File ' + filePath + ' indexed in Files: ' + fileObj._id);
            fs.unlinkSync(filePath);
            console.log('Temp file [' + filePath + '] has been removed');
        });

        //to update operations with last cursor (we use $set to update specific fileds)
        //here we reset the cursor in order to be able to relaunch the Process
        Operations.update({account: params.account}, {$set:{cursor: -2}}, function (err, result) {
            console.log('Last cursor updated in Operations: -2');
        });

        //###### to follow API status
        console.log('Cloud end process update: used, date_last_limit, calls_used');
        Cloud.upsert({api: 'twitter'},
            {
                $set:{used: false}
            },
            function (err, fileObj) {
                console.log('Cloud API limit update: done');
            });

        console.log( '### END followers ###' ) ;
    }

});

// FUNCTIONS -------------------------
function getAccount(screen_name){
    var result = Operations.findOne({account:screen_name});

    return result;
}

function getEstimate(screen_name){

    //var Twit = Npm.require('twit');
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

    //var Twit = Npm.require('twit');
    var fs = Npm.require('fs');
    var path = Npm.require('path') ;
    var T = new Twit({
        consumer_key:         'cCbsm31rM8Pdvd5zMBMS3vDbc', // API key
        consumer_secret:      'qy3BNzuU3thNbcAuYuCaHwZGPVXY54CgI0roUU5vhtI3DD4YME', // API secret
        access_token:         '1688390773-SghtLzX7UePTo495FQ6fNVu5c29a5m2RKRDvUq5',
        access_token_secret:  'IWevuIf3QPgFU5YjxcH6ya0uEDcAhDEi7nOj0hQqNUEcE'
    });

    if(cursor == -2)
        cursor = -1; //todo: to replace in Operations update

    // Set up a future
    var Future = Npm.require('fibers/future');
    var future = new Future();
    // A callback so the job can signal completion
    var onComplete = future.resolver();
    var filePath;

    T.get('followers/list',
        {
            screen_name: screen_name, // [Bloomberg Business = @business]
            cursor: cursor, //1480779301481839900
            count: 200
        },
        function(err, data, response) {
            if(err){
                //cursor = 0;
                onComplete(err, null); //console.log(err);
                //return err;
            }
            else{
                //var base = '/home/ibox';//"C:\\Users\\user\\Documents\\dev" ; //fs.realpathSync('.');

                filePath = path.join(folder, filename) ;
                console.log('File path: ' + filePath ) ;

                console.log('Current cursor : ' + cursor + ', next cursor : ' + data.next_cursor);
                //cursor = data.next_cursor; //next page

                for(var follower in data.users) {
                    //console.log('---------------------------------------');
                    var content = data.users[follower].id_str + '|'
                            + data.users[follower].name + '|'
                            + data.users[follower].screen_name + '|'
                            + data.users[follower].location + "|\n"
                        ;

                    //console.log(data.users[follower].name);
                    fs.appendFile(filePath, content, function (err) { //JSON.stringify(data,null,4)
                        if (err) {
                            //onComplete(err, null);
                            console.log('Append error: ' + err);
                            //return 0;
                        }
                    });
                }
                onComplete(null, data.next_cursor);
            }
        }
    );

    //var cursor_future = future.wait();

    return future.wait();
}