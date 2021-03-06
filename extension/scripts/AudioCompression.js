'use strict';
(function (GLOBAL, chrome) {
    const Compressor = CompressorConstructor;
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
    Compressor.prototype.getProcessor = getProcessor;
    Compressor.prototype.getGain = getGain;
    Compressor.prototype.setGainOptions = setGainOptions;
    Compressor.prototype.setGainAmount = setGainAmount;
    Compressor.prototype.getGainAmount = getGainAmount;
    Compressor.prototype.getAnalyseData = getAnalyseData;

    GLOBAL.Compressor = Compressor;

    function CompressorConstructor(Extension) {
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
        try {
            const p = this.getPort();
            p.postMessage(msg);
        } catch (ex) {
            // Probably in a disconnected state3. IE the popup is not open.
        }
    }

    function captureAudio(msg) {
        this.setProperties(msg.compression);

        chrome.tabs.getSelected(null, (tab) => {
            this.tab = tab;
            if (!this.isEnabled) {
                chrome.tabCapture.capture({ audio: true, video: false }, activateAudioCompression.bind(this));
            } else {
                this.reactivateCompression();
            }
        });

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

        const cmp = this.getCompression();

        const keys = Object.keys(properties);
        keys.forEach(property =>
            cmp[property] && cmp[property].setValueAtTime &&
                cmp[property].setValueAtTime(properties[property], this.getContext().currentTime));
    }

    function updateCompression(msg) {
        msg.compression && this.setCompressionOptions(msg.compression);
        msg.gain && this.setGainOptions(msg.gain);
    }

    function setGainOptions(gain) {
        this.setGainAmount(gain);
        this.getGain().gain.value = gain;
    }

    function activateAudioCompression(mediaSource) {
        if (mediaSource) {
            this.source = this.getContext().createMediaStreamSource(mediaSource);
            this.setCompressionOptions(this.getProperties());
            this.source.connect(this.getCompression());

            // With gain and processor (db meter)
            this.getCompression().connect(this.getGain());
            this.getGain().connect(this.getContext().destination);
            this.getProcessor().connect(this.getContext().destination);

            this.isActive = true;
            this.isEnabled = true;
        }
    }

    function getGain() {
        if (!this.gain) {
            this.gain = this.getContext().createGain();
        }
        return this.gain;
    }

    function getProcessor() {
        if (!this.processor) {
            this.processor = this.getContext().createScriptProcessor(2048, 1, 1);
            this.processor.onaudioprocess = getAnalyseData.bind(this);
        }
        return this.processor;
    }

    function getAnalyseData(evt) {
        if (!evt) return;
        const data = evt.inputBuffer.getChannelData(0);
        this.sendMessage({
            action: 'showAnalyse',
            args: {
                data: data
            }
        })
    }

    function deactivateCompression() {
        if (this.source && this.source.disconnect) {
            this.source.disconnect(this.getCompression());
            this.source.connect(this.getContext().destination);
        }
    }

    function reactivateCompression() {
        this.source.connect(this.getCompression());
        this.isActive = true;
    }

    function getProperties() {
        return this.properties || (this.properties = {
            threshold: -35,
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
            args: {
                compression: this.getProperties(),
                gain: this.getGainAmount(),
                isActive: this.isActive
            }
        });
    }
})(window, chrome);