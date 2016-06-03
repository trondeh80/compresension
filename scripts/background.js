'use strict';
(function () {

  var ext = new Compressions();
  
  // var Ext = ExtConstructor;
  // Ext.prototype.setup = setup;
  // Ext.prototype.activateAudioCompression = activateAudioCompression;
  // Ext.prototype.getContext = getContext;
  // Ext.prototype.getProperties = getProperties;
  // Ext.prototype.setProperties = setProperties;
  // Ext.prototype.getCompression = getCompression;
  // Ext.prototype.captureAudio = captureAudio;
  // Ext.prototype.messageEvent = messageEvent;
  // Ext.prototype.sendMessage = sendMessage;
  // Ext.prototype.getCompressionOptions = getCompressionOptions;
  // Ext.prototype.updateCompression = updateCompression;
  // Ext.prototype.setCompressionOptions = setCompressionOptions;
  //
  // var extension = new Ext();
  //
  // function ExtConstructor() {
  //   this.isActive = false;
  //   this.setup();
  // }
  //
  // function setup() {
  //   var that = this;
  //
  //   chrome.runtime.onInstalled.addListener(function (details) {
  //     // console.log('previousVersion', details.previousVersion);
  //   });
  //
  //   // if browseraction
  //   if (chrome.browserAction) {
  //
  //     chrome.browserAction.onClicked.addListener(function (activeTab) {
  //       chrome.tabs.getSelected(null, function (tab) {
  //         chrome.tabCapture.capture({
  //           audio: true,
  //           video: false
  //         }, activateAudioCompression.bind(that));
  //       });
  //     });
  //
  //   } else if (chrome.pageAction) {
  //
  //     // Activate the pageAction:
  //     chrome.tabs.onUpdated.addListener(function (tabId) {
  //       chrome.pageAction.show(tabId);
  //     });
  //
  //     chrome.tabs.onActivated.addListener(function (tab) {
  //       chrome.pageAction.show(tab.tabId);
  //     });
  //
  //     chrome.extension.onConnect.addListener(function (port) {
  //       this.port = port;
  //       this.port.onMessage.addListener(messageEvent.bind(this));
  //     }.bind(this));
  //   }
  //
  // }
  //
  // function messageEvent(msg) {
  //   if (typeof this[msg['action']] === "function") {
  //     this[msg['action']].call(this, msg.args);
  //   }
  // }
  //
  // function sendMessage(msg) {
  //   this.port.postMessage(msg);
  // }
  //
  // function captureAudio(msg) {
  //   this.setProperties(msg.compression);
  //   chrome.tabs.getSelected(null, function (tab) {
  //     chrome.tabCapture.capture({
  //       audio: true,
  //       video: false
  //     }, activateAudioCompression.bind(this));
  //   }.bind(this));
  // }
  //
  // function getContext() {
  //   if (!this.context) {
  //     this.context = new AudioContext();
  //   }
  //   return this.context;
  // }
  //
  // function getCompression() {
  //   if (!this.compressor) {
  //     this.compressor = this.getContext().createDynamicsCompressor();
  //   }
  //   return this.compressor;
  // }
  //
  // function setCompressionOptions(properties) {
  //   this.setProperties(properties) ;
  //   this.getCompression().threshold.value = properties.threshold;
  //   this.getCompression().knee.value = properties.knee;
  //   this.getCompression().ratio.value = properties.ratio;
  //   this.getCompression().reduction.value = properties.reduction;
  //   this.getCompression().attack.value = properties.attack;
  //   this.getCompression().release.value = properties.release;
  // }
  //
  // function updateCompression(msg){
  //   this.setCompressionOptions(msg.compression) ;
  // }
  //
  // function activateAudioCompression(mediaSource) {
  //   var source = this.getContext().createMediaStreamSource(mediaSource);
  //   this.setCompressionOptions(this.getProperties());
  //   source.connect(this.getCompression());
  //   this.getCompression().connect(this.getContext().destination);
  //   this.isActive = true;
  // }
  //
  // function getProperties() {
  //   return this.properties || (this.properties = {
  //       threshold: -50,
  //       knee: 40,
  //       ratio: 12,
  //       reduction: -40,
  //       attack: 0,
  //       release: 0.25
  //     });
  // }
  //
  // function setProperties(_properties) {
  //   this.properties = _properties;
  // }
  //
  // function getCompressionOptions() {
  //   this.sendMessage({
  //     action: 'setOptions',
  //     args: {compression: this.getProperties(), isActive: this.isActive}
  //   });
  // }

})();