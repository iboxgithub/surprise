Meteor.methods({


    getPageFollowers:function(profile){
        check(profile,String); //checking param type

        Future = Npm.require('fibers/future');

        //global vars
        var result = null, error = null;

        // Client callback : Set up futures for card and BO callbacks
        var futureTwitterAPI = new Future();

        //----------------- TEST BO --------------------
        //FUTURE
        apiCall_getFollowers(profile, futureTwitterAPI); //todo: use meteorhacks:async
        var resultTwitterAPI = futureTwitterAPI.wait();
        console.log('resultTwitterAPI : ' + resultTwitterAPI.result);//JSON.stringify(resultBO,null,4));

        //----------------- END TEST BO --------------------

        return 'hello';
    }
});

/*
 Consumer key : cCbsm31rM8Pdvd5zMBMS3vDbc
 Consumer secret : qy3BNzuU3thNbcAuYuCaHwZGPVXY54CgI0roUU5vhtI3DD4YME
 */



if (Meteor.isServer) {
    Meteor.startup(function () {
        // code to run on server at startup

        //var Sleep = Meteor.npmRequire( 'sleep' ) ;
        var cursor = 1507591097488349000;//-1;
        var n = 0, timeout = 1;

        console.log( 'Start API call' ) ;

        do{
            console.log( 'Loop ' + n ) ;

            //if(n % 15 == 0 ){ //15 iterations par 15 min
            //  console.log('Timeout...');
            //  timeout = 900000;
            //  Sleep.sleep(900); // KO
            //}
            //else{
            //    timeout = 1;
            //}

            cursor = getFollowers('business', cursor, 'followers');


            n ++;

            console.log('Cursor: ' + cursor);
        }
        while(cursor != 0);
        //cursor = getFollowers('business', cursor, 'followers');

        console.log( 'END' ) ;
    });
}


function getFollowers(screen_name, cursor, filename){

    var Twit = Meteor.npmRequire('twit');
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
                var base = "C:\\Users\\user\\Documents\\dev" ; //fs.realpathSync('.');
                var filePath = path.join(base, filename + '.txt' ) ;
                console.log('File path: ' + filePath ) ;

                //headers
                /*fs.appendFile(filePath, 'id|name|screen_name|location|\n', function (err) { //JSON.stringify(data,null,4)
                 if (err) {
                 //cursor = 0;
                 onComplete(err, 'ok'); console.log(err);
                 return 0;
                 }
                 else console.log('OK FS');
                 });*/
                console.log('Current cursor : ' + cursor + ', next cursor : ' + data.next_cursor);
                //cursor = data.next_cursor; //next page

                for(var follower in data.users){
                    //console.log('---------------------------------------');
                    var content = data.users[follower].id_str + '|'
                            + data.users[follower].name + '|'
                            + data.users[follower].screen_name + '|'
                            + data.users[follower].location + "|\n"
                        ;

                    //console.log(data.users[follower].name);
                    fs.appendFile(filePath, content, function (err) { //JSON.stringify(data,null,4)
                        if (err) {
                            //cursor = 0;
                            onComplete(err, 'ok2'); console.log(err);
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
}/**
 * Created by ibox on 08/08/15.
 */
