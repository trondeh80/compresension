'use strict';

var Compressor = CompressorConstructor;
Compressor.prototype.activateAudioCompression = activateAudioCompression;
Compressor.prototype.deactivateCompression = deactivateCompression;
Compressor.prototype.getContext = getContext;
Compressor.prototype.getProperties = getProperties;
Compressor.prototype.setProperties = setProperties;
Compressor.prototype.getCompression = getCompression;
Compressor.prototype.captureAudio = captureAudio;
Compressor.prototype.messageEvent = messageEvent;
Compressor.prototype.sendMessage = sendMessage;
Compressor.prototype.getCompressionOptions = getCompressionOptions;
Compressor.prototype.updateCompression = updateCompression;
Compressor.prototype.setCompressionOptions = setCompressionOptions;
Compressor.prototype.reactivateCompression = reactivateCompression;
Compressor.prototype.getPort = getPort;
Compressor.prototype.getAnalyser = getAnalyser;
Compressor.prototype.getGain = getGain;
Compressor.prototype.setGainOptions = setGainOptions;
Compressor.prototype.setGainAmount = setGainAmount;
Compressor.prototype.getGainAmount = getGainAmount;
Compressor.prototype.getAnalyseData = getAnalyseData;

function CompressorConstructor(Extension, msg) {
    this.isEnabled = false;
    this.isActive = false;
    this.extension = Extension;
}

function messageEvent(msg) {
    if (typeof this[msg['action']] === "function") {
        this[msg['action']].call(this, msg.args);
    }
}

function getPort() {
    return this.extension.getPort();
}

function sendMessage(msg) {
    this.getPort().postMessage(msg);
}

function captureAudio(msg) {
    this.setProperties(msg.compression);
    chrome.tabs.getSelected(null, function (tab) {
        this.tab = tab;
        if (!this.isEnabled) {
            chrome.tabCapture.capture({
                audio: true,
                video: false
            }, activateAudioCompression.bind(this));
        } else {
            this.reactivateCompression();
        }
    }.bind(this));
}

function getContext() {
    if (!this.context) {
        this.context = new AudioContext();
    }
    return this.context;
}

function getCompression() {
    if (!this.compressor) {
        this.compressor = this.getContext().createDynamicsCompressor();
    }
    return this.compressor;
}

function setCompressionOptions(properties) {
    this.setProperties(properties);
    this.getCompression().threshold.value = properties.threshold;
    this.getCompression().knee.value = properties.knee;
    this.getCompression().ratio.value = properties.ratio;
    this.getCompression().reduction.value = properties.reduction;
    this.getCompression().attack.value = properties.attack;
    this.getCompression().release.value = properties.release;
}

function updateCompression(msg) {
    this.setCompressionOptions(msg.compression);
    this.setGainOptions(msg.gain);
}

function setGainOptions(gain) {
    this.setGainAmount(gain);
    this.getGain().gain.value = gain;
}

function activateAudioCompression(mediaSource) {
    this.source = this.getContext().createMediaStreamSource(mediaSource);
    this.setCompressionOptions(this.getProperties());
    this.source.connect(this.getCompression());

    // Original working (only compressor).
    // this.getCompression().connect(this.getContext().destination);

    // With gain
    this.getCompression().connect(this.getGain());
    this.getGain().connect(this.getAnalyser());
    this.getAnalyser().connect(this.getContext().destination);

    // with only visualizer
    // this.getCompression().connect(this.getAnalyser());
    // this.getAnalyser().connect(this.getContext().destination) ;

    this.isActive = true;
    this.isEnabled = true;
}

function getGain() {
    if (!this.gain) {
        this.gain = this.getContext().createGain();
    }
    return this.gain;
}

function getAnalyser() {
    if (!this.analyser) {
        this.analyser = this.getContext().createAnalyser();
        this.analyser.fftSize = 2048;
        this.analyseData = new Uint8Array(this.analyser.frequencyBinCount);
    }
    return this.analyser;
}

function getAnalyseData() {
    this.getAnalyser().getByteTimeDomainData(this.analyseData);
    this.sendMessage({
        action: 'showAnalyse',
        args: {
            data: this.analyseData,
            bufferLength: this.getAnalyser().frequencyBinCount
        }
    })
}

function deactivateCompression() {
    this.source.disconnect(this.getCompression());
    this.getAnalyser().disconnect(this.getContext().destination);
    this.source.connect(this.getContext().destination);
}

function reactivateCompression() {
    this.source.connect(this.getCompression());
    this.getAnalyser().connect(this.getContext().destination);
    this.isActive = true;
}

function getProperties() {
    return this.properties || (this.properties = {
            threshold: -50,
            knee: 40,
            ratio: 12,
            reduction: -40,
            attack: 0,
            release: 0.25
        });
}

function getGainAmount() {
    return this.gainAmount || (this.gainAmount = 0.1);
}

function setGainAmount(_gain) {
    this.gainAmount = _gain;
}

function setProperties(_properties) {
    this.properties = _properties;
}

function getCompressionOptions() {
    this.sendMessage({
        action: 'setOptions',
        args: {compression: this.getProperties(), gain: this.getGainAmount(), isActive: this.isActive}
    });
}
