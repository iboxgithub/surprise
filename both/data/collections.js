/**
 * Created by ibox on 21/09/15.
 */
Cloud = new Mongo.Collection('cloud');

Operations = new Mongo.Collection('operations');

Files = new FS.Collection("files", {
    stores: [new FS.Store.FileSystem("files", {path: Meteor.settings.cfs_storage})]
});

Files.allow({
    download:function(){
        return true;
    }
});