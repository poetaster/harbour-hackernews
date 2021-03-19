import QtQuick 2.0
import Sailfish.Silica 1.0
import "../delegates"

Page {
    id: page
    property string storyBy
    property string storyUrl
    property string storyText
    property string storyTitle
    property string storyKids
    property int storyId

    function httpRequest(url, callback) {
        var doc = new XMLHttpRequest();
        doc.onreadystatechange = function() {
            if (doc.readyState === XMLHttpRequest.DONE) {
                callback(doc);
            }
        }
        doc.open("GET", url);
        doc.send();
    }
    function reloadComments(){
        kidsModel.clear();
        page.httpRequest("https://hacker-news.firebaseio.com/v0/item/" + storyId + ".json", function(doc) {
            var story = JSON.parse(doc.responseText);
            for (var i = 0; i < story.kids.length ; i++) {
                var storyIndex = story.kids[i]
                page.httpRequest("https://hacker-news.firebaseio.com/v0/item/" + storyIndex + ".json", function(doc) {
                    var story = JSON.parse(doc.responseText);
                    //var title = story.title
                    console.debug(JSON.stringify(story));
                    kidsModel.append({"by": story.by, "comms": story.text,"id": story.id});
                });
            }
        });
    }
    onStatusChanged: {
        if (PageStatus.Activating){
          page.reloadComments();
        }
        /*
        switch (status) {
            case PageStatus.Activating:
                indicator.visible = true;
                errorMsg.visible = false;
                timetableDesc.title = qsTr("Searching...");
                fahrplanBackend.getTimeTable();
                break;
            case PageStatus.Deactivating:
                errorMsg.visible = false;
                fahrplanBackend.parser.cancelRequest();
                break;
        }
        */
    }
    // To enable PullDownMenu, place our content in a SilicaFlickable
    SilicaFlickable {
        anchors.fill: parent
        id: storyView
        PullDownMenu {
            MenuItem {
                text: qsTr("Open URL in browser")
                onClicked: {
                    Qt.openUrlExternally(storyUrl)
                }
            }
            MenuItem {
                text: qsTr("Reload")
                onClicked: {
                  page.reloadComments();
                }
            }
        }

        ListModel {
            id: kidsModel
        }
        Column {
            id: header
            width: parent.width

            PageHeader {
                title: storyTitle
            }

            SectionHeader { text: "URL" }
            Label {
                width: parent.width
                textFormat: Text.RichText
                wrapMode: Text.WrapAnywhere
                text: storyUrl
            }
            SectionHeader {
                id: cHead
                text: "Comments"
            }
        }
         Label {
            width: parent.width
            textFormat: Text.RichText
            text: storyText
        }
        /*
        SectionHeader { text: if (storyText != "") { "Story text"} else { "" } }
        Label {
            width: parent.width
            textFormat:  Text.RichText
            text: storyKids
        }

        SectionHeader {
            id: headerKids
            width: parent.width
            text: if (kidsModel.length > 1) { "Children"} else { "" }
        }*/


        SilicaListView {
            id: kidsView
            width: parent.width
            anchors.bottom: parent.bottom
            anchors.top: header.bottom

            model: kidsModel;

            delegate: StoryItem {
                id: delegate
                onClicked: {
                    pageStack.push(Qt.resolvedUrl("ShowComment.qml"), {"storyBy": by,
                                      "storyUrl": storyUrl,
                                       "storyId": id,
                                       "storyText": comms,
                                       "storyTitle": storyTitle});
                }
            }


            VerticalScrollDecorator {}
        }




    }
}
