'use strict';
var App = appConstructor ;
App.prototype.sendMessage = sendMessage ;
App.prototype.addListeners = addListeners ;
App.prototype.getPort = getPort;
App.prototype.messageEvent = messageEvent ;
App.prototype.activate = activate;
App.prototype.deactivate = deactivate;
App.prototype.setOptions = setOptions;

var application = new App();

function appConstructor(){
  this.getPort().onMessage.addListener(this.messageEvent.bind(this)) ;
  $(document).ready(addListeners.bind(this)) ;

  this.sendMessage({
    action:'getCompressionOptions'
  });
}

function setOptions(obj){
  this.compression = obj.compression ;
  _(this.compression).each(function(item, key){
    $('#'+key).val(item) ;
  });

  if (obj.isActive) {
    $('#activate').addClass('hidden') ;
    $('#deactivate').removeClass('hidden') ;
  }else {
    $('#activate').removeClass('hidden') ;
    $('#deactivate').addClass('hidden') ;
  }
}

function addListeners(event){
  document.getElementById('activate').addEventListener('click', activate.bind(this)) ;
  document.getElementById('deactivate').addEventListener('click', deactivate.bind(this)) ;

  $('form input').change(activateChanges.bind(this)) ;
}

function activateChanges(){
  _(this.compression).each(function(item, key){
    this.compression[key] = $('#'+key).val() ;
  }.bind(this));

  this.sendMessage({
    action:'updateCompression',
    args:{
      compression:this.compression
    }
  }) ;
}

function activate(){

  _(this.compression).each(function(item, key){
    this.compression[key] = $('#'+key).val() ;
  }.bind(this));

  this.sendMessage({
    action:'captureAudio',
    args:{
      compression:this.compression
    }
  }) ;
  $('#activate').addClass('hidden') ;
  $('#deactivate').removeClass('hidden') ;
}

function deactivate(){
  this.sendMessage({
    action:'deactivateCompression'
  }) ;

  $('#activate').removeClass('hidden') ;
  $('#deactivate').addClass('hidden') ;
}


function getPort(){
  if (!this.port) {
    this.port = chrome.extension.connect({name: "communicator"});
  }
  return this.port ;
}

function sendMessage(msg){
  chrome.tabs.getSelected(null, function (tab) {
    msg.tabId = tab.id ;
    this.getPort().postMessage(msg) ;
  }.bind(this));

}

function messageEvent(msg){
  if (typeof this[msg['action']] === 'function') {
    this[msg['action']].call(this,msg.args);
  }
}