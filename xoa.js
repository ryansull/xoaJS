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
