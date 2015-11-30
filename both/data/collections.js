/**
 * Created by ibox on 21/09/15.
 */
Cloud = new Mongo.Collection('cloud');

Operations = new Mongo.Collection('operations');

Files = new FS.Collection("files", {
    stores: [new FS.Store.FileSystem("files", {path: "~/surprise_uploads"})]
});

Files.allow({
    download:function(){
        return true;
    }
});