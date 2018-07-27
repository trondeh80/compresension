'use strict';

const Compressions = compressionConstructor ;
Compressions.prototype.messageEvent = messageEvent;
Compressions.prototype.getPort = getPort;

function compressionConstructor(){

  this.tabs = {};

  debugger;

  chrome.runtime.onInstalled.addListener(function (details) {
    // console.log('previousVersion', details.previousVersion);
  });

  // if browseraction
 if (chrome.pageAction) {

    // Activate the pageAction:
    chrome.tabs.onUpdated.addListener(function (tabId) {
      chrome.pageAction.show(tabId);
    });

    chrome.tabs.onActivated.addListener(function (tab) {
      chrome.pageAction.show(tab.tabId);
    });

    chrome.extension.onConnect.addListener(function (port) {
      this.port = port;
      this.port.onMessage.addListener(messageEvent.bind(this));
    }.bind(this));
  }
}

function getPort(){
  return this.port;
}

function messageEvent(msg){
  if (!this.tabs[msg.tabId]) {
    this.tabs[msg.tabId] = new Compressor(this, msg);
  }
  if (typeof this.tabs[msg.tabId][msg['action']] === "function") {
    this.tabs[msg.tabId][msg['action']].call(this.tabs[msg.tabId], msg.args);
  }
}





