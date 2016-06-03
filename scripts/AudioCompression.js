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


function CompressorConstructor(Extension, msg) {
  this.isEnabled = false ;
  this.isActive = false;
  this.extension = Extension ;
  // chrome.tabs.getSelected(null, function (tab) {
  //   chrome.tabCapture.capture({
  //     audio: true,
  //     video: false
  //   }, activateAudioCompression.bind(this));
  // }.bind(this));
}


function messageEvent(msg) {
  if (typeof this[msg['action']] === "function") {
    this[msg['action']].call(this, msg.args);
  }
}

function getPort(){
  return this.extension.getPort();
}

function sendMessage(msg) {
  this.getPort().postMessage(msg);
}

function captureAudio(msg) {
  this.setProperties(msg.compression);
  chrome.tabs.getSelected(null, function (tab) {
    this.tab = tab ;
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
  this.setProperties(properties) ;
  this.getCompression().threshold.value = properties.threshold;
  this.getCompression().knee.value = properties.knee;
  this.getCompression().ratio.value = properties.ratio;
  this.getCompression().reduction.value = properties.reduction;
  this.getCompression().attack.value = properties.attack;
  this.getCompression().release.value = properties.release;
}

function updateCompression(msg){
  this.setCompressionOptions(msg.compression) ;
}

function activateAudioCompression(mediaSource) {
  this.source = this.getContext().createMediaStreamSource(mediaSource);
  this.setCompressionOptions(this.getProperties());
  this.source.connect(this.getCompression());
  this.getCompression().connect(this.getContext().destination);
  this.isActive = true;
  this.isEnabled = true;
}

function deactivateCompression(){
  this.source.disconnect(this.getCompression());
  this.getCompression().disconnect(this.getContext().destination);
  this.source.connect(this.getContext().destination);
}

function reactivateCompression(){
  this.source.connect(this.getCompression());
  this.getCompression().connect(this.getContext().destination);
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

function setProperties(_properties) {
  this.properties = _properties;
}

function getCompressionOptions() {
  this.sendMessage({
    action: 'setOptions',
    args: {compression: this.getProperties(), isActive: this.isActive}
  });
}
