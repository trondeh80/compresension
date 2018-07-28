'use strict';
const App = appConstructor;
App.prototype.sendMessage = sendMessage;
App.prototype.addListeners = addListeners;
App.prototype.getPort = getPort;
App.prototype.messageEvent = messageEvent;
App.prototype.activate = activate;
App.prototype.deactivate = deactivate;
App.prototype.setOptions = setOptions;
App.prototype.getGain = getGain;
App.prototype.getCompressionOptions = getCompressionOptions;
App.prototype.collectData = collectData;
App.prototype.showAnalyse = showAnalyse;
App.prototype.getCanvasContext = getCanvasContext;
App.prototype.getCanvas = getCanvas;

const application = new App();

function appConstructor() {
    this.getPort().onMessage.addListener(this.messageEvent.bind(this));
    $(document).ready(addListeners.bind(this));

    this.sendMessage({
        action: 'getCompressionOptions'
    });
}

function getCanvas() {
    if (!this.canvas) {
        this.canvas = document.getElementById('analyser');
    }
    return this.canvas;
}

function getCanvasContext() {
    if (!this.context) {
        this.context = this.getCanvas().getContext("2d");
    }
    return this.context;
}

function setOptions(obj) {
    this.compression = obj.compression;
    this.gain = obj.gain;

    // Setting the options for compression:
    _(this.compression).each((item, key) => $('#' + key).val(item));

    $("#gain").val(this.gain);

    if (obj.isActive) {
        $('#activate').addClass('hidden');
        $('#deactivate').removeClass('hidden');
    } else {
        $('#activate').removeClass('hidden');
        $('#deactivate').addClass('hidden');
    }
}

function addListeners(event) {
    document.getElementById('activate').addEventListener('click', activate.bind(this));
    document.getElementById('deactivate').addEventListener('click', deactivate.bind(this));

    $('form input').change(activateChanges.bind(this));
}

function getCompressionOptions() {
    _(this.compression).each(function (item, key) {
        this.compression[key] = $('#' + key).val();
    }.bind(this));
    return this.compression;
}

function getGain() {
    return $('#gain').val();
}

function activateChanges() {
    this.sendMessage({
        action: 'updateCompression',
        args: {
            compression: this.getCompressionOptions(),
            gain: getGain()
        }
    });
}

function activate() {
    this.sendMessage({
        action: 'captureAudio',
        args: {
            compression: this.getCompressionOptions(),
            gain: this.getGain()
        }
    });

    $('#activate').addClass('hidden');
    $('#deactivate').removeClass('hidden');
}

function collectData() {
    this.sendMessage({
        action: 'getAnalyseData'
    });
}

function showAnalyse(args) {
    const WIDTH = this.getCanvas().scrollWidth;
    const HEIGHT = 150 ;
    this.getCanvasContext().clearRect(0, 0, WIDTH, HEIGHT);

    let rms, len = 2048, total = 0, i = 0;
    while ( i < len ) {
        total += Math.abs( args.data[i++] ) ;
    }
    rms = Math.sqrt( total / len ) ;

    const widthPercent = rms * 100  ;
    const width = (WIDTH * widthPercent) /100;

    this.getCanvasContext().fillStyle = 'rgb(12,50,50)';
    this.getCanvasContext().fillRect(0, HEIGHT, width, HEIGHT);


    // var barWidth = (WIDTH / args.bufferLength) * 2.5;
    // var barHeight;
    // var x = 0;
    // for (var i = 0; i < args.bufferLength; i++) {
    //     barHeight = args.data[i] / 2;
    //     this.getCanvasContext().fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
    //     this.getCanvasContext().fillRect(x, HEIGHT - barHeight / 2, barWidth, barHeight);
    //     x += barWidth + 1;
    // }

}
function getRMSValue(args){
    var rms, len = args.data.length, total = 0, i = 0;
    while ( i < len ) total += Math.abs( args.data[i++] ) ;
    rms = Math.sqrt( total / len ) ;

    var widthPercent = ( rms * 100 ) + '%' ;
}

function deactivate() {
    this.sendMessage({
        action: 'deactivateCompression'
    });
    $('#activate').removeClass('hidden');
    $('#deactivate').addClass('hidden');
}

function getPort() {
    if (!this.port) {
        this.port = chrome.extension.connect({name: "communicator"});
    }
    return this.port;
}

function sendMessage(msg) {
    chrome.tabs.getSelected(null, function (tab) {
        msg.tabId = tab.id;
        this.getPort().postMessage(msg);
    }.bind(this));

}

function messageEvent(msg) {
    if (typeof this[msg['action']] === 'function') {
        this[msg['action']].call(this, msg.args);
    }
}