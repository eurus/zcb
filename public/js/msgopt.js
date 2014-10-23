function loadChatHis (myPeerId,otherPeerId,limit,timestamp) {
    AV.Cloud.run("getchathis", {frompid:myPeerId,
                                topid:otherPeerId,
                                limit:limit,
                                timestamp:timestamp}, {
         success: function(data){
            _.each(data,function (his) {
                if (myPeerId == his.from){
                  prependSendMsg(otherPeerId, JSON.parse(his.data).Content,his.timestamp);
                }else{
                    var data = {
                        msg:his.data,
                        fromPeerId:otherPeerId,
                        timestamp:his.timestamp
                    }
                   prependRecvMsg(data);
                }
            })
         }
    });
}
function addChatHis (myPeerId,otherPeerId) {
    AV.Cloud.run("getchathis", {frompid:myPeerId,topid:otherPeerId}, {
         success: function(data){
            _.each(data,function (his) {
                console.log(his);
                console.log(myPeerId);
                if (myPeerId == his.from){
                  appendSendMsg(otherPeerId, JSON.parse(his.data).Content,his.timestamp);
                }else{
                    var data = {
                        msg:his.data,
                        fromPeerId:otherPeerId,
                        timestamp:his.timestamp
                    }
                   appendRecvMsg(data);
                }
            })
         }
    });
}
//append msg for init msg
function appendSendMsg(peerId, content,timestamp){
    // 这里是发送的消息append
    str = _.template($('#text-tpl').html())({
        peerId:peerId,
        content:content,
        avatar: localStorage[myPeerId+'-avatar'],
        timestamp:timestamp,
        klass:'from-me'
    });
    var elem = $(str);
    $('#'+peerId).append(elem);
    scrollToEnd(peerId);
}

function appendRecvMsg(data){
    console.log('HOLY CRAP');
    receive_msg = JSON.parse(data.msg);

    var from_avatar = data.fromPeerId + "-avatar";
    switch(receive_msg.InfoType) {
        case "IMAGE":
        str2 = _.template($('#image-tpl').html())({
            peerId: data.fromPeerId,
            content: receive_msg.Content,
            avatar: localStorage[from_avatar] == 'undefined' ? 'img/user1.png' : localStorage[from_avatar],
            timestamp: data.timestamp,
            klass:'to-me'
        });

        break;

        case "VOICE":

        str2 = _.template($('#voice-tpl').html())({
            peerId: data.fromPeerId,
            content: receive_msg.Content,
            avatar: localStorage[from_avatar] == 'undefined' ? 'img/user1.png' : localStorage[from_avatar],
            timestamp: data.timestamp,
            klass:'to-me'
        });
        break;

        case "TEXT":

        str2 = _.template($('#text-tpl').html())({
            peerId: data.fromPeerId,
            content: receive_msg.Content,
            avatar: localStorage[from_avatar] == 'undefined' ? 'img/user1.png' : localStorage[from_avatar],
            timestamp: data.timestamp,
            klass:'to-me'
        });                   
        break;
    }             
    if (data.fromPeerId!=toPeerId){
        var count = $('#user-'+data.fromPeerId+' .badge').html();
        console.log('count = '+count);
        count = parseInt(count) || 0;
        count += 1;
        console.log('count after = '+count);
        $('#user-'+data.fromPeerId+' .badge').html(count); 
    }
    // console.log("str2"+str2);
    $('#'+data.fromPeerId).append(str2);

    $('.msg.msg-voice > .audiojs').each(function(e){
        $(this).replaceWith($('audio', $(this)));

    })
    audiojs.events.ready(function() {
        var as = audiojs.createAll();
    });

    scrollToEnd(data.fromPeerId);

}
//prepend msg for load chat history

function prependSendMsg(peerId, content,timestamp){
    // 这里是发送的消息append
    str = _.template($('#text-tpl').html())({
        peerId:peerId,
        content:content,
        avatar: localStorage[myPeerId+'-avatar'],
        timestamp:timestamp,
        klass:'from-me'
    });
    var elem = $(str);
    $('#'+peerId).prepend(elem);
}

function prependRecvMsg(data){
    receive_msg = JSON.parse(data.msg);

    var from_avatar = data.fromPeerId + "-avatar";
    switch(receive_msg.InfoType) {
        case "IMAGE":
        str2 = _.template($('#image-tpl').html())({
            peerId: data.fromPeerId,
            content: receive_msg.Content,
            avatar: localStorage[from_avatar] == 'undefined' ? 'img/user1.png' : localStorage[from_avatar],
            timestamp: data.timestamp,
            klass:'to-me'
        });

        break;

        case "VOICE":

        str2 = _.template($('#voice-tpl').html())({
            peerId: data.fromPeerId,
            content: receive_msg.Content,
            avatar: localStorage[from_avatar] == 'undefined' ? 'img/user1.png' : localStorage[from_avatar],
            timestamp: data.timestamp,
            klass:'to-me'
        });
        break;

        case "TEXT":

        str2 = _.template($('#text-tpl').html())({
            peerId: data.fromPeerId,
            content: receive_msg.Content,
            avatar: localStorage[from_avatar] == 'undefined' ? 'img/user1.png' : localStorage[from_avatar],
            timestamp: data.timestamp,
            klass:'to-me'
        });                   
        break;
    }             
    if (data.fromPeerId!=toPeerId){
        var count = $('#user-'+data.fromPeerId+' .badge').html();
        console.log('count = '+count);
        count = parseInt(count) || 0;
        count += 1;
        console.log('count after = '+count);
        $('#user-'+data.fromPeerId+' .badge').html(count); 
    }
    // console.log("str2"+str2);
    $('#'+data.fromPeerId).prepend(str2);

    $('.msg.msg-voice > .audiojs').each(function(e){
        $(this).replaceWith($('audio', $(this)));

    })
    audiojs.events.ready(function() {
        var as = audiojs.createAll();
    });
}