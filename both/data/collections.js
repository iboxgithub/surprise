/**
 * Created by ibox on 21/09/15.
 */
Operations = new Mongo.Collection('operations');

Files = new FS.Collection("files", {
    stores: [new FS.Store.FileSystem("files", {path: "~/surprise_uploads"})]
});

Files.allow({
    download:function(){
        return true;
    }
});