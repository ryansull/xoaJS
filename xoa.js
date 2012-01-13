/*********************************************************************************************
*   Welcome to Ryan's Tiny Cross Origin AJAX library
*
*   This library requires jQuery to be loaded.
*
*   This library was written to get around Javascript's Same Origin Policy. The same origin 
*   policy prevents a document or script loaded from one origin from getting or setting 
*   properties of a document from another origin.  This is great for security reasons, but
*   annoying if you own both origins.  For example, http://a.geneca.com and http://b.geneca.com
*   cannot communicate with eachother through ajax calls.  
*
*   XOA uses HTML5 cross document messaging to communicate between 2 different origins
*   through a dynamically loaded iframe.  
*
*   Example Usage:
*   This example will send a message to a web service.  the webservice will tack on 
*       'touched by xoa' to whatever message is sent to it, and returns it.
*
*
*   Domain A (web service):
*
*   $(function(){
*       xoa.RegisterWebServiceListener(messageReceivedFromClient);
*   });
*
*	function messageReceivedFromClient(data){
*       xoa.ReturnDataToClient(data + " touched by xoa");
*   }
*
*
*
*   Domain B (client):
*
*   function getStuff(){
*       xoa.PostMessageToWebService('http:\\a.geneca.com\getStuff.htm', "get stuff", callback);
*   }
*
*   function getStuffCallback(data){
*       alert(data);
*   }
*
*
*
*   The result should be that Domain B will alert "get stuff touched by xoa".
*
*   
***********************************************************************************************/

var xoa = (function () {
    var originalCallback, originalWebServiceCallback;
    var iframeLoaded, frame, t, message;

    var generateIFrameContainingURL = function (iFrameURL) {
        iframeLoaded = false;
        var frameId = 'webServiceFrame';
        var frameHTML = '<iframe id="' + frameId + '" src="' + iFrameURL + '" style="visibility:hidden;display:none"/>'
        $("body").append(frameHTML);
        return frameId;
    };

    var postMessageToWebService = function (iFrameURL, message, callback) {
        this.message = message;
        var frameId = generateIFrameContainingURL(iFrameURL);
        frame = document.getElementById(frameId);
        originalCallback = callback;
        window.addEventListener("message", postMessageCallback, false);
        $(frameId).load(function () {
            dynamicIFrameLoaded();
        });
        t = setTimeout(checkIfIFrameLoaded, 100);
    };

    var checkIfIFrameLoaded = function () {
        if (iframeLoaded) {
            t = null;
        } else {
            dynamicIFrameLoaded();
        }
    };

    var dynamicIFrameLoaded = function () {
        t = null;
        frame.contentWindow.postMessage(this.message, "*");
    };

    var postMessageCallback = function (event) {
        iframeLoaded = true;
        var data = event.data;
        window.removeEventListener("message", postMessageCallback, false);
        $("#webServiceFrame").remove();
        originalCallback(data);
    };

    var registerWebServiceListener = function (callback) {
        originalWebServiceCallback = callback;
        window.addEventListener("message", webserviceCallback, false);
    };

    var webserviceCallback = function (event) {
        var data = event.data;
        originalWebServiceCallback(data);
    };

    var returnDataToClient = function (data) {
        window.parent.postMessage(data, "*");
    };

    return {
        /* Public methods */
        PostMessageToWebService: function (iFrameURL, message, callback) {
            postMessageToWebService(iFrameURL, message, callback);
        },

        RegisterWebServiceListener: function (callback) {
            registerWebServiceListener(callback);
        },

        ReturnDataToClient: function (data) {
            returnDataToClient(data);
        }
    };

})();
