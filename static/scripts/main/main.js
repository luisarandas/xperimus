/**
 * 
 *  Sttera Main Instance
 *  © 2020
 * 
 */

import { newFile } from '../ui/ui.js';
import { DatasetViz, removeNonFixedChildrenFromWordDiv, plotSpectrogram, blinkButtons } from '../ui/ui.js'
//import { FluidSynthProcessor_ } from '../worklet/worklet.js';

/* Init Sockets */
console.log("check multiple audio contexts");
console.log("clearning complete with color");
console.log("color and size of learners");
console.log("include sound to blue");
console.log("factor oracle and supervizd metadata")
//https://web.dev/profiling-web-audio-apps-in-chrome/
//brave://tracing/

var protocol = window.location.protocol;
var socket = io.connect(protocol + '//' + document.domain + ":" + location.port); //port + namespace);

socket.on('connect', function(data) {
  console.log('init', this);
});

var thisDeviceID;
socket.on('message', function(data) {
  thisDeviceID = data;
});

var _isMobile = false; 
var bufferStruct = [];

/* Instantiate ID Variables */

const _addToPlayersPool = document.getElementById('add-room-players');
const _barprog = document.getElementById('barprog');

const candidateWordsContainer = document.getElementById('candidate-words');

const collectButtonsDiv = document.getElementById('collect-words');

const datasetFileInput = document.getElementById('dataset-file-input');
const deleteTransferModelButton = document.getElementById('delete-transfer-model');

const downloadAsFileButton = document.getElementById('download-dataset');
const durationMultiplierSelect = document.getElementById('duration-multiplier');

const epochsInput = document.getElementById('epochs');
const enterLearnWordsButton = document.getElementById('enter-learn-words');

const evalModelOnDatasetButton = document.getElementById('eval-model-on-dataset');
const evalResultsSpan = document.getElementById('eval-results');

const _fileInput = document.getElementById('audio-file');
const fineTuningEpochsInput = document.getElementById('fine-tuning-epochs');

const includeWavForm = document.getElementById('include-wav');
const learnWordsInput = document.getElementById('learn-words');

const loadTransferModelButton = document.getElementById('load-transfer-model');

const lock_Room = document.getElementById('lock-room');
const modalContent = document.getElementById('modal-content');
const modal = document.getElementById("amazonmodal");
const modelIOButton = document.getElementById('model-io');
const mixNoiseDataset = document.getElementById('mixnoise');
const playBufferDevices = document.getElementById('play-buffer-devices');
const playSocketStreamed = document.getElementById('play-stream-socket');

const predictionCanvas = document.getElementById('prediction-canvas');
const probaThresholdInput = document.getElementById('proba-threshold');

const new_Room = document.getElementById('new-room');
const _room = document.getElementById("interroom");
const saveTransferModelButton = document.getElementById('save-transfer-model');
const saveTransferModelButtonDisk = document.getElementById('save-transfer-model-disk');

const savedTransferModelsSelect = document.getElementById('saved-transfer-models'); // hidden
const saveDetectionFile = document.getElementById('save-detection-to-file');
const span = document.getElementById("closemodal");

const startButton = document.getElementById('start');
const startTransferLearnButton = document.getElementById('start-transfer-learn');

const statusDisplay = document.getElementById('status-display');

const stopButton = document.getElementById('stop');

const streamAudioFile = document.getElementById('stream-audio-file');

const transferModelSaveLoadInnerDiv = document.getElementById('transfer-model-save-load-inner');
const transferModelNameInput = document.getElementById('transfer-model-name');

const uploadFilesButton = document.getElementById('upload-dataset');

var detectOnFile = false;
var detectOnWorklet = false;

/* Sttera Declaration */

var intervalOne, intervalTwo, connectSpecificRoom, thisIdRoom;

const Sttera = { 

  name: "",
  players: 0,
  playerIDS: [],
  thisid: thisDeviceID,
  roomArr: [],

  /* New Emitter */ 

  NewRoom(room) {

    this.name = room;
    this.thisid = thisDeviceID;
  
    _room.value = room;
    _room.disabled = true;
    _room.style.backgroundColor = "rgb(38, 165, 164)";
    _room.style.color = "black";
    //_room.style.border = "1px solid grey";
    
    lock_Room.disabled = true;
    lock_Room.backgroundColor = "rgb(38, 165, 164)";
    lock_Room.style.border = "1px solid grey";//aqui
    
  },

  DeleteRoom() {

    this.name = "";
    this.playerIDS = [];
    _room.value = "";
    _room.disabled = false;
    _room.style.backgroundColor = "rgba(52,52,52,1)";
    _room.style.color = "#DCDCDC";
    _room.style.border = "1px solid black";
  
    lock_Room.disabled = false;
    lock_Room.backgroundColor = "rgba(52,52,52,1)";
    lock_Room.style.border = "1px solid black";

  },

  SendData(type, secs) {

    let data = [this.name, secs];
    if (type == 'bang') {
      function _sendData() {
        socket.emit("sttera-emitter-send", data);
        blinkSender();
      }
      intervalOne = setInterval(_sendData, secs)
    }

  },

  StopSend() {

    clearInterval(intervalOne);
    console.log("Stopped Bang Sender");

  },

  PingConnectedUsers() {
    socket.emit("sttera-emitter-ping", this.playerIDS);
    //socket.emit("sttera-emitter-ping-graphics", this.playerIDS);
  },

  StreamSinglerUserPool(id) {
    socket.emit("sttera-emitter-user-pool", id);
  },

  /*SendSpecific(clientid, type, secs) {
    let data = [this.name, clientid, secs];
    if (type == 'bang') {
      function _sendSpecific() {
        socket.emit("sttera-emitterwid-send", data);
        blinkSender();
      }
      intervalTwo = setInterval(_sendSpecific, secs);
    }
  },

  StopSpecific() {

  },*/

  GetPlayers(which) {
    if (which != undefined) {
      return this.playerIDS[which];
    } else {
      return this.playerIDS;
    }
  },
    
  /* New Receiver */ 

  Connect() {
    
    for (let i = 0; i < arguments.length; i++) {
      if (typeof arguments[i] === 'string') {
        this.roomArr.push(arguments[i]);
      }
    }
    console.log(this.roomArr);
  },

  Disconnect() {
    for (let i = 0; i < arguments.length; i++) {
      if (typeof arguments[i] === 'string') {
        var _index = this.roomArr.indexOf(arguments[i])
        if (_index > -1) {
          this.roomArr.splice(_index, 1);
        }
      }
    }
    console.log(this.roomArr);
  },

  ParticipateWithID() {

    for (let i = 0; i < arguments.length; i++) {
      if (typeof arguments[i] === 'string') {
        //socket.emit("participate here");//
        //ligar-se a uma máquina baseada no ID do seu utilizador
      }
    }
  }
}


const SttGen = {

  SttCtx: new (window.AudioContext || window.webkitAudioContext),
  SttOsc: "",//: this.SttCtx.createOscillator(),
  SttGain: "",//: this.SttCtx.createGainNode(),

  Setup: function() {
    this.SttOsc = this.SttCtx.createOscillator();
    this.SttGain = this.SttCtx.createGain();

    this.SttOsc.type = 'sine'; //set periodic for custom -- sine,square,sawtooth,triangle
    this.SttGain.connect(this.SttCtx.destination);
    this.SttOsc.connect(this.SttGain);

    this.SttOsc.frequency.setValueAtTime(440, this.SttCtx.currentTime);
    this.SttGain.gain.setValueAtTime(0, this.SttCtx.currentTime);
    this.SttGain.gain.linearRampToValueAtTime(1, this.SttCtx.currentTime + 0.05);
    this.SttOsc.start(0);

    this.SttGain.gain.linearRampToValueAtTime(0, this.SttCtx.currentTime + 0.5);
    //this.SttOsc.stop(this.SttCtx.currentTime + 0.5);
  }

  /*SttCtx: new (window.AudioContext || window.webkitAudioContext)(),
  SttCode: `
  import("stdfaust.lib");
  process = ba.pulsen(1, 10000) : pm.djembe(60, 0.3, 0.4, 1) <: dm.freeverb_demo;`,
  SttCode_: `
  import("stdfaust.lib");
  process = ba.pulsen(1, 10000) : pm.djembe(ba.hz2midikey(freq), 0.3, 0.4, 1) * gate * gain with {
      freq = hslider("freq", 440, 40, 8000, 1);
      gain = hslider("gain", 0.5, 0, 1, 0.01);
      gate = button("gate");
  };
  effect = dm.freeverb_demo;`,

  SttCtx: new (window.AudioContext || window.webkitAudioContext),
  SttOsc: "",//: this.SttCtx.createOscillator(),
  SttGain: "",//: this.SttCtx.createGainNode(),

  Setup: function() {
    this.SttOsc = this.SttCtx.createOscillator();
    this.SttGain = this.SttCtx.createGain();

    this.SttOsc.type = 'sine'; //set periodic for custom -- sine,square,sawtooth,triangle
    this.SttGain.connect(this.SttCtx.destination);
    this.SttOsc.connect(this.SttGain);

    this.SttOsc.frequency.setValueAtTime(440, this.SttCtx.currentTime);
    this.SttGain.gain.setValueAtTime(0, this.SttCtx.currentTime);
    this.SttGain.gain.linearRampToValueAtTime(1, this.SttCtx.currentTime + 0.05);
    this.SttOsc.start(0);

    this.SttGain.gain.linearRampToValueAtTime(0, this.SttCtx.currentTime + 0.5);
    //this.SttOsc.stop(this.SttCtx.currentTime + 0.5);
  }*/
}

/* Sttera Sockets */ 

socket.on('sttera-receiver-receive', function(data) {
  if (Sttera.roomArr.indexOf(data[0]) !== -1) {
    console.log("received-meterLuz?");
    blinkReceiver();
    callback();
  }
});

socket.on('sttera-ping-receive', function(data) {
  SttGen.Setup();  
  blinkMobilePanel();
});

socket.on('sttera-user-pool-receive', function(data) {
  SttGen.Setup();
  blinkMobilePanel();
});

/*socket.on('play-on-regions', function(data) {
  SttGen.Setup();
  blinkMobilePanel();
});*/

socket.on('struct-buffer-obj', function(data) {
  console.log(data);
});

/* Add Event Listeners */


window.addEventListener("keydown", function(e) { 

  if (e.keyCode == 32) {
    if (interfaceMode == true) {
      _bufwavesurfer.play(); 
    }
  }


  if (e.keyCode == 192) {

    const audioCtx = new (window.AudioContext || window.webkitAudioContext);

    const _audioWorklet = audioCtx.audioWorklet;
    
    const faust = new Faust2WebAudio.Faust({ 
      debug: true, 
      wasmLocation: "../static/scripts/faust/libfaust-wasm.wasm", 
      dataLocation: "../static/scripts/faust/libfaust-wasm.data" 
    });
    
    window.faust = faust;
    
    faust.ready.then(() => {

        var polycode = `import("stdfaust.lib");

        ///////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Simple demo of wavetable synthesis. A LFO modulate the interpolation between 4 tables.
        // It's possible to add more tables step.
        //
        ///////////////////////////////////////////////////////////////////////////////////////////////////
        // MIDI IMPLEMENTATION:
        //
        // CC 1 : LFO Depth (wave travel modulation)
        // CC 14 : LFO Frequency
        // CC 70 : Wave travelling
        //
        // CC 73 : Attack
        // CC 76 : Decay
        // CC 77 : Sustain
        // CC 72 : Release
        //
        ///////////////////////////////////////////////////////////////////////////////////////////////////
        // GENERAL
        midigate = button ("gate");
        midifreq = nentry("freq[unit:Hz]", 440, 20, 20000, 1);
        midigain = nentry("gain", 0.5, 0, 1, 0.01);
        
        waveTravel = hslider("waveTravel [midi:ctrl ]",0,0,1,0.01);
        
        // pitchwheel
        pitchwheel = hslider("bend [midi:pitchwheel]",1,0.001,10,0.01);
        
        gFreq = midifreq * pitchwheel;
        
        // LFO
        lfoDepth = hslider ("lfoDepth[midi:ctrl 1]",0,0.,1,0.001):si.smoo;
        lfoFreq  = hslider ("lfoFreq[midi:ctrl 14]",0.1,0.01,10,0.001):si.smoo;
        moov = ((os.lf_trianglepos(lfoFreq) * lfoDepth) + waveTravel) : min(1) : max(0);
        
        volA = hslider("A[midi:ctrl 73]",0.01,0.01,4,0.01);
        volD = hslider("D[midi:ctrl 76]",0.6,0.01,8,0.01);
        volS = hslider("S[midi:ctrl 77]",0.2,0,1,0.01);
        volR = hslider("R[midi:ctrl 72]",0.8,0.01,8,0.01);
        envelop = en.adsre(volA,volD,volS,volR,midigate);
        
        // Out Amplitude
        vol = envelop * midigain ;
        
        WF(tablesize, rang) = abs((fmod ((1+(float(ba.time)*rang)/float(tablesize)), 4.0 ))-2) -1.;
        
        // 4 WF maxi with this version:
        scanner(nb, position) = -(_,soustraction) : *(_,coef) : cos : max(0)
        with{
            coef = 3.14159 * ((nb-1)*0.5);
            soustraction = select2( position>0, 0, (position/(nb-1)) );
        };
        
        wfosc(freq) = (rdtable(tablesize, wt1, faze)*(moov : scanner(4,0)))+(rdtable(tablesize, wt2, faze)*(moov : scanner(4,1)))
                        + (rdtable(tablesize, wt3, faze)*(moov : scanner(4,2)))+(rdtable(tablesize, wt4, faze)*(moov : scanner(4,3)))
        with {
            tablesize = 1024;
            wt1 = WF(tablesize, 16);
            wt2 = WF(tablesize, 8);
            wt3 = WF(tablesize, 6);
            wt4 = WF(tablesize, 4);
            faze = int(os.phasor(tablesize,freq));
        };
        
        process = wfosc(gFreq) * vol;`; 
        
        faust.getNode(polycode, { audioCtx, useWorklet: _audioWorklet ? true : false, voices: 4, args: { "-I": "libraries/" } })
        .then(node => {

          console.log(node);
          console.log(node.port)

          node.port.onmessage = (e) => {
            //console.log(e.data);
            //node.port.postMessage('pong');
          }

            window.node = node;
            
            node.connect(audioCtx.destination);
            node.keyOn(0, 60, 100);
            setTimeout(() => node.keyOn(0, 64, 40), 500);
            setTimeout(() => node.keyOn(0, 67, 80), 1000);
        });
    });

    /*const unlockAudioContext = (audioCtx) => {
        if (audioCtx.state !== "suspended") return;
        const b = document.body;
        const events = ["touchstart", "touchend", "mousedown", "keydown"];
        const unlock = () => audioCtx.resume().then(clean);
        const clean = () => events.forEach(e => b.removeEventListener(e, unlock));
        events.forEach(e => b.addEventListener(e, unlock, false));
    }
    unlockAudioContext(audioCtx);*/
  }
  if (e.keyCode == 187) {
    //https://github.com/Fr0stbyteR/faust2webaudio/blob/f72d0a3f14b348016199d93a4c3d64304b1f7682/src/FaustAudioWorkletNode.ts
    //window.node.destroy();
    //window.node.allNotesOff();
    //window.node.keyOff(0, 67, 1000);

    window.node.keyOn(0, 60, 100);
    
  }


  if (e.keyCode == 49) {

    var w = $(window).width();
    if ( $('#first-page').position().left == 0) {
      $("#first-page").css({right: w, position:'absolute'});
      $("#second-page").css({left: 0, position:'absolute'});
    } else if ($('#first-page').position().left != 0) {
      $("#first-page").css({right: 0, position:'absolute'});
      $("#second-page").css({left: w, position:'absolute'});
    }
  }
});
console.log("wrap region functions and gui");

var annotationID = 0;
var annotObject;

[document.querySelector('#playstop1'), document.querySelector('#playstop2'), document.querySelector('#playstop3'), document.querySelector('#playstop5'), document.querySelector('#playstop6'), document.querySelector('#playstop7'), document.querySelector('#run-code'), document.querySelector('#selectlist'), document.querySelector('#selectlist2'), document.querySelector('#selectlist3'), document.querySelector('#selectlist4'), document.querySelector('#selectlist5'), document.querySelector('#ping-connected-users'), document.querySelector('#navigate-buffer-minus'), document.querySelector('#navigate-buffer-plus'), document.querySelector('#send-full-metabuffer'), document.querySelector('#detect-trigger-file'), document.querySelector('#detect-trigger-worklet')]
  .forEach(item => {
    
    item.addEventListener('click', event => {

     if (item.id == "playstop1") {
      _bufwavesurfer.play();
     }
     if (item.id == "playstop2") {
      _bufwavesurfer.pause();
     }
     if (item.id == "playstop3") {
      _bufwavesurfer.stop();
     }
     if (item.id == "playstop5") {

      var ctime = _bufwavesurfer.getCurrentTime();
      var dur = _bufwavesurfer.getDuration();

      _bufwavesurfer.addRegion({
        start: ctime,
        end: ctime + dur/7,
        color: 'rgba(78,215,214,0.2)',
        id: annotationID
      });

      var ctimefloat = parseFloat(ctime).toFixed(3);
      var ctimefloat_ = ctimefloat.replace(".", ":");

      var durfloat = parseFloat(dur/7).toFixed(3);
      var durfloat_ = durfloat.replace(".", ":");

      var _regfloat = ctime + dur/7;
      var regfloat_ = parseFloat(_regfloat).toFixed(3);
      var regfloat__ = regfloat_.replace(".", ":");

      annotationID++;
      addRegions();

     }

     if (item.id == "playstop6") {
      _bufwavesurfer.clearRegions();
     }

     if (item.id == "playstop7") {
      var w = window.open("", "", "toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=780,height=200,top="+(screen.height-400)+",left="+(screen.width-840));
      w.document.title = 'Audio Spectrogram';
     }

     if (item.id == "detect-trigger-file") {
      blinkButtons("detect-trigger-file");
      if (detectOnFile == false) {
        detectOnFile = true;
      } else {
        detectOnFile = false;
      }
     }
     if (item.id == "detect-trigger-worklet") {
      blinkButtons("detect-trigger-worklet");
      if (detectOnWorklet == false) {
        detectOnWorklet = true;
      } else {
        detectOnWorklet = false;
      }
    }

     if (item.id == "navigate-buffer-minus") {
      if (bufferStruct.length > 1 && bufferStruct[currentBufferUpload] != undefined && currentBufferUpload != 0 && currentBufferUpload <= bufferStruct.length) {
        
        for (i = 2; i < bufferStruct[currentBufferUpload].length; i++) {
          bufferStruct[currentBufferUpload].splice(i, 2);
          addRegions();
        }
        
        currentBufferUpload--;
        wavBufDisplay.innerHTML = `Buffer: ${currentBufferUpload+1}`;
        _bufwavesurfer.load(bufferStruct[currentBufferUpload][1]);
        for (i = 0; i < bufferStruct[currentBufferUpload]; i++) {
          console.log(i);
        }
      } 
      storeAndReadAnnotations(); 
     }

     if (item.id == "navigate-buffer-plus") {
      if (bufferStruct.length > 1 && bufferStruct[currentBufferUpload] != undefined && currentBufferUpload != bufferStruct.length-1 && currentBufferUpload <= bufferStruct.length) {
        
        for (i = 2; i < bufferStruct[currentBufferUpload].length; i++) {
          bufferStruct[currentBufferUpload].splice(i, 2);
          addRegions();
        }

        currentBufferUpload++;
        wavBufDisplay.innerHTML = `Buffer: ${currentBufferUpload+1}`;
        _bufwavesurfer.load(bufferStruct[currentBufferUpload][1]);
        for (i = 0; i < bufferStruct[currentBufferUpload]; i++) {
          console.log(i);
        }
      } 
      storeAndReadAnnotations();
     }

     if (item.id == "send-full-metabuffer") {
       socket.emit('struct-buffer-obj', bufferStruct);
     }

     if (item.id == "run-code") {

      function evaluate() {
        var code = myCodeMirror.getValue();
        eval(code); // add new protot with security solve
        console.log(Sttera); 
      }
      evaluate();
     }

     if (item.id == "ping-connected-users") {
      Sttera.PingConnectedUsers();
     }

  });
  if (item.id == "selectlist") {
    item.addEventListener('change', (evt) => {
      if (item.value == "Emitter") { myCodeMirror.setValue("/** Sttera Connection Editor  \n Emitter Example */ \n\n\n// Creating new Room\nSttera.NewRoom('xperimus-room');\n\n// Sending Impulses p/Sec\nSttera.SendData('bang', 1000);\n"); }
      if (item.value == "Receiver") { myCodeMirror.setValue("/** Sttera Connection Editor  \n Receiver Example */ \n\n\n// Connect to Room\nSttera.Connect('xperimus-room');\n\n// Function Triggerd w Sockets\nfunction callback() {\n   // Code Here\n}"); }
      if (item.value == "Generators") { myCodeMirror.setValue("/** Sttera Connection Editor  \n Generators Example */ \n\n\nSttGen.Setup();"); }
      if (item.value == "Document") { myCodeMirror.setValue("/** Sttera Connection Editor  \n Document Example */ \n\n\n// Connect to Room\nSttera.Connect('xperimus-room');\n\n// Function Triggerd w Sockets\nfunction callback() {\n\n   var a = Math.floor(Math.random() * 256);\n   var bgColor = 'rgb(' + a + ',' + a + ',' + a + ')';\n   codeCanvas.style['background-color'] = bgColor;\n\n}"); }   
    });
  }
});

function isArrayInArray(arr, item){
  var item_as_string = JSON.stringify(item);

  var contains = arr.some(function(ele){
    return JSON.stringify(ele) === item_as_string;
  });
  return contains;
}

function addRegions() {

  var regions = _bufwavesurfer.regions.list;

  for (var key in regions) {
    var obj = regions[key];
    var objstart = Math.round((obj.start + Number.EPSILON) * 100) / 100;
    var objend = Math.round((obj.end + Number.EPSILON) * 100) / 100;
    var annot = [objstart, objend];
    for (i = 0; i < annot.length; i++) {
      if (!typeof i != "number") {
        if (isArrayInArray(bufferStruct[currentBufferUpload], annot) == false) {
          bufferStruct[currentBufferUpload].push(annot);
        }
      }
    }
  }
  console.log(bufferStruct);
}

/* Document Init */

window.initMobile = function() {
  if (_isMobile == true) {
    var _e = document.getElementById('mobile-room').value;
    var mobile_values = [_e, thisDeviceID];
    socket.emit('sttera-mobile-send', mobile_values);
  }
}

if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
|| /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4)) || $(window).width() < 960) { 
  _isMobile = true;
  mobilePerformanceSetup();
}

document.addEventListener('DOMContentLoaded', () => {

  setTimeout(function () {
    $('#splashscreen').hide();
  }, 2500);
  $("#second-page").css({left: $(window).width(), position:'absolute'}); // this will return the left and top


});

/*
if (isStreamingOnWavesurfer == true) {
  socket.emit("play-on-region", "-");
}*/

async function blinkMobilePanel() {
  document.getElementById("mobile-panel").style["background-color"] = "white";
  setTimeout(function(){
    document.getElementById("mobile-panel").style["background-color"] = "#202020";
  }, 70)
}

lock_Room.addEventListener('click', () => {
  if (_room && _room.value) {
    Sttera.NewRoom(_room.value);
    console.log(Sttera);
  }
});

new_Room.addEventListener('click', () => {
  Sttera.DeleteRoom();
  console.log(Sttera);
});


_addToPlayersPool.addEventListener('click', () => {
  console.log(Sttera);
  for (i = 0; i < Sttera.players; i++) {
    var _newplayerDiv = document.createElement('div');
    _newplayerDiv.className = "draggable";
    _newplayerDiv.innerHTML = [i];
    _newplayerDiv.id = Sttera.playerIDS[i]; 
    
    document.getElementById('room').appendChild(_newplayerDiv);
    $(_newplayerDiv).draggable({containment: "parent", cancel: 'button'});  

    var _newplayerImpulse = document.createElement('button');
    _newplayerImpulse.className = "draggableImpulse";
    _newplayerImpulse.onclick = function() {
      Sttera.StreamSinglerUserPool(this.parentNode.id);
    }
    _newplayerDiv.appendChild(_newplayerImpulse);
  
  }
  console.log(document.getElementById('room'));
  console.log(Sttera);
});

function callback() {}

var _audioCtx = new (window.AudioContext || window.webkitAudioContext); //second on mobile

var currentBufferUpload = 0;
var _currentBufferUpload = 0;

var arrayBuffer;
var bufAttrs = [];

const wavBufDisplay = document.getElementById("wav-buffer-display");

_fileInput.addEventListener("change", function(event) {

  var files = event.target.files;

  for (var i = 0; i < files.length; i++) {
    (function(file) {
      var reader = new FileReader();
      reader.onload = function(e) {
        var blob = new window.Blob([new Uint8Array(e.target.result)]);
        let audio = new Audio();
        audio.src = URL.createObjectURL(blob);
        bufferStruct.push([_currentBufferUpload, audio.src]);
        _bufwavesurfer.clearRegions();
        _bufwavesurfer.load(audio);
      }
      reader.addEventListener("loadend", function(e) {
        arrayBuffer = reader.result;

        _audioCtx.decodeAudioData(reader.result, function(buffer) {
          
          var _channeldata = buffer.getChannelData(0);
          arrayBuffer = new Float32Array(_channeldata);
          bufAttrs = []; 
          bufAttrs.push(buffer.length, buffer.duration, buffer.sampleRate, buffer.numberOfChannels);
    
          bufferStruct[_currentBufferUpload].push([bufAttrs, arrayBuffer.buffer]);
          _currentBufferUpload++;

          currentBufferUpload = bufferStruct.length-1;    
          wavBufDisplay.innerHTML = `Buffer: ${currentBufferUpload+1}`;
      
        });
      });
      reader.readAsArrayBuffer(file);
    })(files[i]);
  }
});

streamAudioFile.addEventListener("click", function(event) {

  socket.emit("new-buffer", bufAttrs);
  socket.emit("buffer-qual", arrayBuffer.buffer);
  console.log(bufAttrs);
  console.log(arrayBuffer.buffer);

});

playBufferDevices.addEventListener("click", function(event) {
  socket.emit("play-buffer", "play");
  console.log(bufferStruct);
});

console.log("avoidmultiple streaming on button click");


function storeAndReadAnnotations() {

  _bufwavesurfer.clearRegions();
  
  for (let i = 2; i < bufferStruct[currentBufferUpload].length; i++) {
    if (typeof bufferStruct[currentBufferUpload][i][0] === 'number' && !isNaN(bufferStruct[currentBufferUpload][i][0]) && typeof bufferStruct[currentBufferUpload][i][1] === 'number' && !isNaN(bufferStruct[currentBufferUpload][i][1])) {
      _bufwavesurfer.addRegion({
        start: bufferStruct[currentBufferUpload][i][0],
        end: bufferStruct[currentBufferUpload][i][1],
        color: 'rgba(78,215,214,0.2)',
      });
    }  
  }
}



var _newSongData;
var newSongBufferToCopy;

socket.on('new-buffer', function(data) {
  console.log(data);
  _newSongData = data
});

socket.on('buffer-qual', function(data) {

  //console.log(_newSongData); [e.g. 88200, 2, 44100, 2]
    //console.log(__arrayBuffer); [Float32Array (x)]

  var __arrayBuffer = new Float32Array(data);

  var myArrayBuffer = _audioCtx.createBuffer(_newSongData[3], _newSongData[0], _newSongData[2]);
  myArrayBuffer.copyToChannel(__arrayBuffer, 0, 0); 
  
  if (_newSongData[3] != 1) {
    myArrayBuffer.copyToChannel(__arrayBuffer, 1, 0);
  } 
  //myArrayBuffer.duration = _newSongData[1];
  var _source = _audioCtx.createBufferSource();
  _source.buffer = myArrayBuffer;
  newSongBufferToCopy = myArrayBuffer;
  _source.connect(_audioCtx.destination);
  _source.start();

  document.getElementById("mobile-hasbuffer").style["background-color"] = "white";
  setTimeout(function(){
    document.getElementById("mobile-hasbuffer").style["background-color"] = "rgba(38,165,164,1)";
  }, 70);  

});

console.log("STREAM MULTIPLE FILES to array");

socket.on("buffer-play", function(data) {

  var _source = _audioCtx.createBufferSource();
  _source.buffer = newSongBufferToCopy;

  _source.connect(_audioCtx.destination);
  _source.start();
  blinkMobilePanel();

});

/*
playSocketStreamed.addEventListener("mousedown", function(){ //add all btns
  playSocketStreamed.style.backgroundColor = 'rgba(38,165,164,1)';
});

playSocketStreamed.addEventListener("mouseup", function() {
  playSocketStreamed.style.backgroundColor = '#353535';
});

playSocketStreamed.addEventListener('click', () => {
  socket.emit("play-buffer", "play");
});*/

socket.on('play-on-detected-file', function(data) {
  console.log(data, "play file buffers");
  var _source = _audioCtx.createBufferSource();
  _source.buffer = newSongBufferToCopy;
  _source.connect(_audioCtx.destination);
  _source.start();
  blinkMobilePanel();
  SttGen.Setup(); // add faust code 
});

socket.on('play-on-detected-worklet', function(data) {
  console.log(data, "play worklet");
  var _source = _audioCtx.createBufferSource();
  _source.buffer = newSongBufferToCopy;
  _source.connect(_audioCtx.destination);
  _source.start();
  blinkMobilePanel();
  SttGen.Setup(); // add faust code 
});

function mobilePerformanceSetup() {
  document.body.innerHTML = "";
  $('body').append("<div id='mobile-connect' style='position: absolute; left: 2%; top: 2%; width: 96%; height: 40%; background-color: rgba(30,30,30,1)'>" + 
                      "<div><input id='mobile-room' placeholder='Specify Room' style='color: white; background-color: #2c2c2c; border: 1px solid black; height: 30px;'></input></div>" +
                      "<button onclick='initMobile()'>connect</button>" + 
                    "</div>" + 
                    "<div id='mobile-hasbuffer' style='position: absolute; left: 2%; top: 44%; width: 96%; height: 12%; background-color: rgba(30,30,30,1)'></div>" +
                    "<div id='mobile-panel' style='position:absolute; left: 2%; bottom: 2%; width: 96%;height:40%;z-index:100;background:rgba(30,30,30,1);'>" + 
                    "</div>");
}

//windows.wasm



var isRecruiting = true;
socket.on('sttera-frommobile', function(data) {
  if (data[0] == Sttera.name && Sttera.playerIDS.includes(data[1]) != true && isRecruiting == true) {
    Sttera.playerIDS.push(data[1]);
    Sttera.players++;
    document.getElementById('number-connected-users').innerHTML++
    console.log(Sttera);
  }
});


const _bufwavesurfer = WaveSurfer.create({
  container: '#bufferplot',
  waveColor: 'rgba(200,200,200,1)',
  progressColor: 'rgba(38,165,164,1)',
  loaderColor: 'rgba(38,165,164,1)',
  cursorColor: 'rgba(38,165,164,1)',
  height: 75,
  normalize: true,
  minimap: true,
  backend: 'MediaElement',
  plugins: [
    WaveSurfer.regions.create(/*{
      regions: [
          {
              start: 1,
              end: 3,
              loop: false,
              color: 'hsla(400, 100%, 30%, 0.5)'
          }, {
              start: 5,
              end: 7,
              loop: false,
              color: 'hsla(200, 50%, 70%, 0.4)'
          }
      ],
      dragSelection: {
          slop: 5
      }
  }*/),
    WaveSurfer.timeline.create({
      container: '#cont6',
      primaryColor: 'white',
      secondaryColor: 'white',
      primaryFontColor: 'white',
      secondaryFontColor: 'white'
    }),

    WaveSurfer.cursor.create({
      showTime: true,
      opacity: 1,
      customShowTimeStyle: {
        'background-color': '#000',
        color: 'rgba(38,165,164,1)',
        padding: '2px',
        'font-size': '10px'
      }
    }),
  ]
});

var xhr = new XMLHttpRequest();
xhr.open('GET','./static/scripts/audio/drum-loop.wav', true);
xhr.responseType = 'arraybuffer';

var blob_url;
xhr.onload = function(e) {

  var responseArray = new Uint8Array(this.response).buffer; 

  var blob = new window.Blob([responseArray]);
  var URLObject = window.webkitURL || window.URL;
  blob_url = URLObject.createObjectURL(blob);
  _bufwavesurfer.load(blob_url);
  
  var audioData = responseArray;

  _audioCtx.decodeAudioData(audioData, function(buffer) {
    var _channeldata = buffer.getChannelData(0);
    audioData = new Float32Array(_channeldata);
    bufAttrs = []; 
    bufAttrs.push(buffer.length, buffer.duration, buffer.sampleRate, buffer.numberOfChannels);

    bufferStruct.push([_currentBufferUpload, './static/scripts/audio/drum-loop.wav']);
    bufferStruct[_currentBufferUpload].push([bufAttrs, audioData.buffer]);      
    currentBufferUpload = bufferStruct.length-1;
    _currentBufferUpload++;

    console.log(bufferStruct);
  });
};

xhr.send();


/*
bufferStruct.push([_currentBufferUpload, './static/scripts/audio/drum-loop.wav']);
_bufwavesurfer.load('./static/scripts/audio/drum-loop.wav');
console.log(_bufwavesurfer);
_currentBufferUpload++;
*/
  // var reader = new FileReader();



_bufwavesurfer.on('region-click', function(region, e) {
  e.stopPropagation();
  annotObject = region;
  e.shiftKey ? region.playLoop() : region.play();
});

_bufwavesurfer.on('region-in', function (region, e) {
  annotObject = region;

  document.getElementById("blink-when-region").style["background-color"] = "rgba(38,165,164,1)";
  setTimeout(function(){
    document.getElementById("blink-when-region").style["background-color"] = "#353535";
  }, 70)
});

_bufwavesurfer.on('region-out', function(region, e) {
  document.getElementById("blink-when-region").style["background-color"] = "rgba(38,165,164,1)";
  setTimeout(function(){
    document.getElementById("blink-when-region").style["background-color"] = "#353535";
  }, 70)
});



/*
_bufwavesurfer.on('region-mouseleave', function (region, e) {
  annotObject = region;

});
_bufwavesurfer.on('region-updated', function(region, e) {

});
_bufwavesurfer.on('region-created', function(region,e) {
})

_bufwavesurfer.on('region-mouseenter', function (region, e) {
  annotObject = region;
});

_bufwavesurfer.on('region-updated', function (region, e) {
  annotObject = region;
});



_bufwavesurfer.on('region-removed', function (region, e) {
  annotObject = region;
});
//CLEAR REGIONS*/

async function playstopRegion(v) {
  if (v == "play") {
    annotObject.playLoop();
    console.log("playloop?");
  }
  if (v == "stop") {
    _bufwavesurfer.pause();

  }
  if (v == "close") {
    annotObject.remove();
  }
}


_bufwavesurfer.on('region-play', function(region) {
  region.once('out', function() {
    _bufwavesurfer.play(region.start);
    _bufwavesurfer.pause();
  });
});






//window.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.OIndexedDB || window.msIndexedDB;
//IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.OIDBTransaction || window.msIDBTransaction; 
var dbVersion = 1;

var isIndexDbTransactionPossible = window.IDBTransaction || window.webkitIDBTransaction;
if (isIndexDbTransactionPossible) {
        isIndexDbTransactionPossible.READ_WRITE = isIndexDbTransactionPossible.READ_WRITE || 'readwrite';
        isIndexDbTransactionPossible.READ_ONLY = isIndexDbTransactionPossible.READ_ONLY || 'readonly';
}    


var albumBucketName = "xperimusmodels";
var bucketRegion = "eu-west-2";
var IdentityPoolId = "eu-west-2:52abaf84-383f-4377-8e8f-3bc8ca05c8fd";

AWS.config.region = 'eu-west-2'; 
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: IdentityPoolId,
});

var s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  params: { Bucket: albumBucketName }
});

function listAmazonObjects() {
  if (_isMobile != true) {
    document.getElementById("cont11").innerHTML = "Trained Models<br>";
    var __main = document.getElementById('cont11');
  
    s3.listObjects(function (err, data) {
      if(err)throw err;
      //var e = data.Contents[0].Key;
      var e = data.Contents
      var _e = JSON.stringify(e);
    
      Object.keys(e).forEach((key, index) => {
    
        if (e[key].Key.includes("Model") == true && e[key].Key.length > 7) {
          var button = document.createElement("button");
          button.className = "amazonClass"; 
          button.innerHTML = e[key].Key;
  
          __main.appendChild(document.createElement("br"));    
          __main.appendChild(button);        
  
        } 
        if (e[key].Key.includes("Dataset") == true && e[key].Key.length > 9) {

          var _button = document.createElement("button");
          _button.className = "amazonClass"; 
          _button.innerHTML = e[key].Key;
          document.getElementById('cont12').appendChild(document.createElement("br"));    
          document.getElementById('cont12').appendChild(_button);
        }
    
      });
    
      for (i = 0; i < __main.children.length; i++) {
        if (!__main.children[i].innerHTML.includes('metadata') && !__main.children[i].innerHTML.includes('weights')) {
          console.log(__main.children[i].innerHTML); // works
        }
      }
    });
  }

}

listAmazonObjects();

const tensorflow = tf; // check later
const SpeechCommands = speechCommands;
const XFER_MODEL_NAME = 'xfer-model';
const MIN_EXAMPLES_PER_CLASS = 8;

var recognizer;
var transferWords;
var transferRecognizer;
var transferDurationMultiplier;

console.log("search for batch size - save with epochs");


(async function() {
    recognizer = SpeechCommands.create('BROWSER_FFT');
    recognizer.ensureModelLoaded().then(() => {
        startButton.disabled = false;
        transferModelNameInput.value = `xperimus-${getDateString()}`;

        console.log("Loaded Model");
        console.log(recognizer.modelInputShape());
        console.log(recognizer);
        console.log(recognizer.params());

        const params = recognizer.params();
        console.log(`sampleRateHz: ${params.sampleRateHz}`);
        console.log(`fftSize: ${params.fftSize}`);
        console.log(`spectrogramDurationMillis: ` + `${params.spectrogramDurationMillis.toFixed(2)}`);
        console.log(`tf.Model input shape: ` + `${JSON.stringify(recognizer.modelInputShape())}`);
    }).catch(err => {
        console.log("Failed: ", err.message);
    });
    console.log(recognizer);

})();

var BACKGROUND_NOISE_TAG = SpeechCommands.BACKGROUND_NOISE_TAG;
var UNKNOWN_TAG = SpeechCommands.UNKNOWN_TAG;
var detection_Object = [];

startButton.addEventListener('click', () => {

    startButton.disabled = true;
    blinkButtons('start');

    var time = new Date();
    var _time =  time.toTimeString() + " [" + time.getDate() + '-' + (time.getMonth()+1) + '-' + time.getFullYear() + ']';
    detection_Object = [];
    detection_Object.push(`Started Microphone at ${_time} \n`);

    const activeRecognizer = transferRecognizer == null ? recognizer : transferRecognizer;
    populateCandidateWords(activeRecognizer.wordLabels());

    const suppressionTimeMillis = 1000;
    activeRecognizer.listen( result => {

        plotPredictions(predictionCanvas, activeRecognizer.wordLabels(), result.scores, 3, suppressionTimeMillis);
    }, {   
        includeSpectrogram: true,
        suppressionTimeMillis,
        probabilityThreshold: Number.parseFloat(probaThresholdInput.value)
    })
    .then(() => { 
        startButton.disabled = true;
        stopButton.disabled = false;
        console.log("Streaming recognition started.");
    })
    .catch(err => {
        console.log("Failed to start streaming: ", err.message);
        console.log(err);
    });
});

stopButton.addEventListener('click', () => {
    document.getElementById('candidate-words').innerHTML = "";
    document.getElementById('probabil').innerHTML = "";
    document.getElementById('micdiv').innerHTML = "";
    blinkButtons('start');
    const activeRecognizer = transferRecognizer == null ? recognizer : transferRecognizer;
    activeRecognizer.stopListening()
    .then(() => {
        startButton.disabled = false;
        stopButton.disabled = true;
        console.log("Streaming recognition stopped.");
    })
    .catch(err => {
        console.log("Failed to stop streaming display: ", err.message);
    });
});

saveDetectionFile.addEventListener('click', () => {
  console.log(detection_Object);
  var textdocument = document.createElement('a');
  textdocument.href = 'data:attachment/text,' + encodeURI(detection_Object.join('\n'));
  textdocument.target = '_blank';
  textdocument.download = 'xperimus-detected.txt';
  textdocument.click();
});

/** Transfer Learning Logic */

let collectWordButtons = {};
let datasetViz;

var includeAudioWaveformSpec = false;
var augmentNoise = false;

function createProgressBarAndIntervalJob(parentElement, durationSec) {

    const progressBar = document.createElement('progress');
    progressBar.value = 0;

    progressBar.style['width'] = "100%";
    progressBar.style['height'] = "95%";
    progressBar.style['background-color'] = 'red';
    progressBar.style['color'] = 'red';
    progressBar.style['border-radius'] = "3px";

    const intervalJob = setInterval(() => {
        progressBar.value += 0.05;
    }, durationSec * 1e3 / 20);
    parentElement.appendChild(progressBar);
    return {progressBar, intervalJob};
}


/**
 * divs for the words
 * @param {string[]} transferWords The array of transferwords
 * @returns {Object} An object mapping word to th div element created for ir
 * 
 */

function createWordDivs(transferWords) {
    //clear first
    while (collectButtonsDiv.firstChild) {
        collectButtonsDiv.removeChild(collectButtonsDiv.firstChild);
    }
    datasetViz = new DatasetViz(
        transferRecognizer, collectButtonsDiv, MIN_EXAMPLES_PER_CLASS,
        startTransferLearnButton, downloadAsFileButton,
        transferDurationMultiplier);
    
    const wordDivs = {};
    for (const word of transferWords) {


        const wordDiv = document.createElement('div');
        wordDiv.classList.add('word-div');

        wordDiv.style['backgroundColor'] = 'rgba(32, 32, 32, 1)';
        wordDiv.style['border'] = '1px solid grey';
        wordDiv.style['margin'] = '2px';
        wordDiv.style['border-radius'] = '3px';
        wordDiv.style['position'] = 'relative';
        wordDiv.style['width'] = "99%";//'calc(100% - 2px)';
        wordDiv.style['height'] = "60px";//'calc(100% - 2px)';


        wordDivs[word] = wordDiv;
        wordDiv.setAttribute('word', word);


        const button = document.createElement('button');

        button.setAttribute('isFixed', 'true');
        button.style['display'] = 'inline-clock';
        button.style['position'] = "absolute";//'calc(100% - 2px)';
        button.style['vertical-align'] = 'middle';
        button.style['height'] = "60px";
        //button.style['width'] = "45px";
        button.style['background-color'] = "rgba(53,53,53,1)";
        button.style['color'] = "rgba(200,200,200,1)";
        button.style['border-radius'] = "3px";
        button.style['border'] = "1px solid black";
        button.style['minWidth'] = "75px";
        button.style['font-size'] = "10px";//'calc(100% - 2px)';

        const displayWord = word === BACKGROUND_NOISE_TAG ? 'Noise' : word;

        button.textContent = `${displayWord} (0)`;
        wordDiv.appendChild(button);
        wordDiv.className = 'transfer-word';
        collectButtonsDiv.appendChild(wordDiv);
        collectWordButtons[word] = button;
        
        let durationInput;
        if (word === BACKGROUND_NOISE_TAG) {
            // create noise duration input
            wordDiv.childNodes[0].style['height'] = '34px'; 
            durationInput = document.createElement('input');
            //durationInput.setAttribute('isFixed', 'true');
            durationInput.value = '10[sec]';
            durationInput.style['position'] = 'absolute';
            durationInput.style['text-align'] = 'center';
            durationInput.style['bottom'] = '0px';
            durationInput.style['width'] = '69px';
            durationInput.style['right'] = '0px !important';

            durationInput.style['height'] = '22px';
            //durationInput.style['left'] = '0px';
            wordDiv.appendChild(durationInput);
            //create time-unit span for noise duration
            const timeUnitSpan = document.createElement('span');
            timeUnitSpan.setAttribute('isFixed', 'true');
            timeUnitSpan.classList.add('settings');
            timeUnitSpan.style['vertical-align'] = 'middle';
            //timeUnitSpan.textContent = 'seconds'; SHOW SECONDS
            wordDiv.appendChild(timeUnitSpan);
        }

        button.addEventListener('click', async () => {
            //disableAllCollectWordButtons();
            removeNonFixedChildrenFromWordDiv(wordDiv);

            const collectExampleOptions = {};
            let durationSec;
            let intervalJob;
            let progressBar;

            if (word === BACKGROUND_NOISE_TAG) {
            // If the word type is background noise, display a progress bar during
            // sound collection and do not show an incrementally updating
            // spectrogram.
            // _background_noise_ examples are special, in that user can specify
            // the length of the recording (in seconds).
                collectExampleOptions.durationSec = Number.parseFloat(durationInput.value);
                durationSec = collectExampleOptions.durationSec;

                const barAndJob = createProgressBarAndIntervalJob(_barprog, durationSec);
                progressBar = barAndJob.progressBar;
                intervalJob = barAndJob.intervalJob;
            } else {

                collectExampleOptions.durationMultiplier = transferDurationMultiplier;
                let tempSpectrogramData;
                const tempCanvas = document.createElement('canvas');
                
                var _leftSize = wordDiv.childNodes[0].offsetWidth; 

                tempCanvas.style['margin-left'] = `${_leftSize + 31}px`;
                tempCanvas.style['border-radius'] = '3px';

                tempCanvas.height = 50;
                wordDiv.appendChild(tempCanvas);

                collectExampleOptions.snippetDurationSec = 0.1;
                collectExampleOptions.onSnippet = async (spectrogram) => {
                    if (tempSpectrogramData == null) {
                        tempSpectrogramData = spectrogram.data;
                    } else {
                        tempSpectrogramData = SpeechCommands.utils.concatenateFloat32Arrays(
                            [tempSpectrogramData, spectrogram.data]);
                    }
                    plotSpectrogram(
                        tempCanvas, tempSpectrogramData, spectrogram.frameSize,
                        spectrogram.frameSize, {pixelsPerFrame: 2});
                }
            }
            collectExampleOptions.includeRawAudio = includeAudioWaveformSpec;
            const spectrogram = await transferRecognizer.collectExample(word, collectExampleOptions);

            if (intervalJob != null) {
                clearInterval(intervalJob);
            }
            if (progressBar != null) {
                _barprog.removeChild(progressBar);
            }
            const examples = transferRecognizer.getExamples(word);
            const example = examples[examples.length - 1];
            await datasetViz.drawExample(
                wordDiv, word, spectrogram, example.example.rawAudio, example.uid);
            //enableAllCollectWordButtons();
        });
    }    
    return wordDivs;
}

enterLearnWordsButton.addEventListener('click', () => {
    const modelName = transferModelNameInput.value;
    if (modelName == null || modelName.length === 0) {
        enterLearnWordsButton.textContent = 'Need Name!';
        setTimeout(() => {
            enterLearnWordsButton.textContent = 'Start Transfer';
        }, 2000);
        return;
    }

    transferDurationMultiplier = durationMultiplierSelect.value;

    learnWordsInput.disabled = true;
    transferWords = learnWordsInput.value.trim().split(',').map(w => w.trim());
    transferWords.splice(0,0,"_background_noise_");
    if (transferWords == null || transferWords.length <= 1) {
        console.log("ERROR: Invalid list of transfer words");
        return;
    }

    transferRecognizer = recognizer.createTransfer(modelName);
    createWordDivs(transferWords);

});

startTransferLearnButton.addEventListener('click', async () => {
    startTransferLearnButton.disabled = true;
    startButton.disabled = true;
    startTransferLearnButton.textContent = 'Learning Started';

    await tf.nextFrame();

    const INITIAL_PHASE = 'initial';
    const FINE_TUNING_PHASE = 'fineTuningPhase';

    const epochs = parseInt(epochsInput.value);
    const fineTuningEpochs = parseInt(fineTuningEpochsInput.value);
    const trainLossValues = {};
    const valLossValues = {};
    const trainAccValues = {};
    const valAccValues = {};

    for (const phase of [INITIAL_PHASE, FINE_TUNING_PHASE]) {
        const phaseSuffix = phase === FINE_TUNING_PHASE ? ' (FT)' : '';
        const lineWidth = phase === FINE_TUNING_PHASE ? 2 : 1;
        trainLossValues[phase] = {
            x: [],
            y: [],
            name: 'train' + phaseSuffix,
            mode: 'lines',
            line: {width: lineWidth}
        };
        valLossValues[phase] = {
            x: [],
            y: [],
            name: 'val' + phaseSuffix,
            mode: 'lines',
            line: {width: lineWidth}
        };
        trainAccValues[phase] = {
            x: [],
            y: [],
            name: 'train' + phaseSuffix,
            mode: 'lines',
            ilne: {width: lineWidth}
        };
        valAccValues[phase] = {
            x: [],
            y: [],
            name: 'val' + phaseSuffix,
            mode: 'lines',
            line: {width: lineWidth}
        };
    }
    function plotLossAndAccuracy(epoch, loss, acc, val_loss, val_acc, phase) {
        const displayEpoch = phase === FINE_TUNING_PHASE ? (epoch + epochs) : epoch;
        trainLossValues[phase].x.push(displayEpoch);
        trainLossValues[phase].y.push(loss);
        trainAccValues[phase].x.push(displayEpoch);
        trainAccValues[phase].y.push(acc);
        valLossValues[phase].x.push(displayEpoch);
        valLossValues[phase].y.push(val_loss);
        valAccValues[phase].x.push(displayEpoch);
        valAccValues[phase].y.push(val_acc);
        
        startTransferLearnButton.textContent = phase === INITIAL_PHASE ?
            `Learning (${(epoch / epochs * 1e2).toFixed(0)}%)` :
            `Learning (FT)... (${
                (epoch / fineTuningEpochs * 1e2).toFixed(0)}%)`
                
    }

    const augmentByMixingNoiseRatio = augmentNoise == true ? 0.5 : null;
    console.log(`augmentByMixingNoiseRatio = ${augmentByMixingNoiseRatio}`);
    await transferRecognizer.train({
        epochs,
        validationSplit: 0.25,
        augmentByMixingNoiseRatio,
        callback: {
            onEpochEnd: async (epoch, logs) => {
                plotLossAndAccuracy(
                    epoch, logs.loss, logs.acc, logs.val_loss, logs.val_acc,
                    INITIAL_PHASE);
            }
        },
        fineTuningEpochs,
        fineTuningCallback: {
            onEpochEnd: async (epoch, logs) => {
                plotLossAndAccuracy(
                    epoch, logs.loss, logs.acc, logs.val_loss, logs.val_acc,
                    FINE_TUNING_PHASE);
            }
        }
    });
    saveTransferModelButtonDisk.disabled = false;
    transferModelNameInput.value = transferRecognizer.name;
    transferModelNameInput.disable = true;
    startTransferLearnButton.textContent = 'Learning Complete';
    transferModelNameInput.disabled = false;
    startButton.disabled = false;
    evalModelOnDatasetButton.disabled = false;
});


downloadAsFileButton.addEventListener('click', () => {
    const basename = getDateString();
    const artifacts = transferRecognizer.serializeExamples();

    const anchor = document.createElement('a');
    anchor.download = `${document.getElementById('transfer-model-name').value}`
    anchor.href = window.URL.createObjectURL(
        new Blob([artifacts], {type: 'application/octet-stream'}));
    anchor.click();
})

function getDateString() {

  //Make various returns with different ones
  
    const d = new Date();
    const year = `${d.getFullYear()}`;
    let month = `${d.getMonth() + 1}`;
    let day = `${d.getDate()}`;
    if (month.length < 2) {
      month = `0${month}`;
    }
    if (day.length < 2) {
      day = `0${day}`;
    }
    let hour = `${d.getHours()}`;
    if (hour.length < 2) {
      hour = `0${hour}`;
    }
    let minute = `${d.getMinutes()}`;
    if (minute.length < 2) {
      minute = `0${minute}`;
    }
    let second = `${d.getSeconds()}`;
    if (second.length < 2) {
      second = `0${second}`;
    }
    return `${year}-${month}-${day}`;
}

async function loadDatasetInTransferRecognizer(serialized) {
    const modelName = transferModelNameInput.value;
    if (modelName == null || modelName.length === 0) {
        throw new Error('Need model name!');
    }
    if (transferRecognizer == null) {
        transferRecognizer = recognizer.createTransfer(modelName);
    }
    transferRecognizer.loadExamples(serialized);
    const exampleCounts = transferRecognizer.countExamples();
    transferWords = [];
    const modelNumFrames = transferRecognizer.modelInputShape()[1];
    const durationMultipliers = [];
    for (const word in exampleCounts) {
        transferWords.push(word);
        const examples = transferRecognizer.getExamples(word);
        for (const example of examples) {
            const spectrogram = example.example.spectrogram;
            // ignore _background_noise examples when determining the duration (is?)
            // multiplier of the dataset.
            if (word !== BACKGROUND_NOISE_TAG) {
                durationMultipliers.push(Math.round(spectrogram.data.length / spectrogram.frameSize / modelNumFrames));
            }
        }
    }
    transferWords.sort();
    learnWordsInput.value = transferWords.join(',');

    //determine the transferDurationMultiplier value from the dataset.

    transferDurationMultiplier = durationMultipliers.length > 0 ? Math.max(...durationMultipliers) : 1;
    console.log(`Determined transferDurationMultiplier from uploaded ` + `dataset: ${transferDurationMultiplier}`);
    createWordDivs(transferWords);
    datasetViz.redrawAll();
}


evalModelOnDatasetButton.addEventListener('click', async () => {
    const files = datasetFileInput.files;
    if (files == null || files.length !== 1) {
      throw new Error('Must select exactly one file.');
    }
    evalModelOnDatasetButton.disabled = true;
    const datasetFileReader = new FileReader();
    datasetFileReader.onload = async event => {
      try {
        if (transferRecognizer == null) {
          throw new Error('There is no model!');
        }
  
        // Load the dataset and perform evaluation of the transfer
        // model using the dataset.
        transferRecognizer.loadExamples(event.target.result);
        const evalResult = await transferRecognizer.evaluate({
          windowHopRatio: 0.25,
          wordProbThresholds: [
            0,    0.05, 0.1,  0.15, 0.2,  0.25, 0.3,  0.35, 0.4,  0.5,
            0.55, 0.6,  0.65, 0.7,  0.75, 0.8,  0.85, 0.9,  0.95, 1.0
          ]
        });
        // Plot the ROC curve.
        const rocDataForPlot = {x: [], y: []};
        evalResult.rocCurve.forEach(item => {
          rocDataForPlot.x.push(item.fpr);
          rocDataForPlot.y.push(item.tpr);
        });
        
        evalResultsSpan.textContent = `AUC = ${evalResult.auc}`;
      } catch (err) {
        const originalTextContent = evalModelOnDatasetButton.textContent;
        evalModelOnDatasetButton.textContent = err.message;
        setTimeout(() => {
          evalModelOnDatasetButton.textContent = originalTextContent;
        }, 2000);
      }
      evalModelOnDatasetButton.disabled = false;
    };
    datasetFileReader.onerror = () =>
        console.error(`Failed to binary data from file '${dataFile.name}'.`);
    datasetFileReader.readAsArrayBuffer(files[0]);
});
  
async function populateSavedTransferModelsSelect() {

    const savedModelKeys = await SpeechCommands.listSavedTransferModels();
    while (savedTransferModelsSelect.firstChild) {
      savedTransferModelsSelect.removeChild(savedTransferModelsSelect.firstChild);
    }
    if (savedModelKeys.length > 0) {
      for (const key of savedModelKeys) {
        const option = document.createElement('option');
        option.textContent = key;
        option.id = key;
        savedTransferModelsSelect.appendChild(option);
      }
    }
}

console.log("supervizd metadata");

saveTransferModelButton.addEventListener('click', async () => {
    
    //await transferRecognizer.save();

    await populateSavedTransferModelsSelect(); 
    saveTransferModelButton.textContent = 'Model saved!';
    //await transferRecognizer.save('downloads://my-model'); //await
    await transferRecognizer.save(`indexeddb://${document.getElementById('transfer-model-name').value}`);
    //await transferRecognizer.save('localstorage://my-model'); //await
    await indexddb();
});

saveTransferModelButtonDisk.addEventListener('click', async () => {
  console.log("well");
  await transferRecognizer.save(`downloads://${document.getElementById('transfer-model-name').value}`);
  var _a = transferRecognizer.words;
  downloadObjectAsJson(_a, `${document.getElementById('transfer-model-name').value}-metadata`);
  saveTransferModelButtonDisk.textContent = 'Model saved!';
});

function downloadObjectAsJson(exportObj, exportName){
  var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
  var downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href",     dataStr);
  downloadAnchorNode.setAttribute("download", exportName + ".json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

var transactedAmazonModel, transactedAmazonModel1;
var transac = false;
var loadedmodel;

async function indexddb() {

  var DBOpenRequest = window.indexedDB.open("tensorflowjs", dbVersion);

    DBOpenRequest.onsuccess = function(event) {

      db = DBOpenRequest.result;

      function getData() {

        var transaction = db.transaction(["models_store"], "readwrite");

        transaction.oncomplete = function(event) {
        };

        // create an object store on the transaction
        // Make a request to get a record by key from the object store
        var objectStore = transaction.objectStore("models_store");
        
        var objectStoreRequest = objectStore.get(`${document.getElementById("transfer-model-name").value}`);

        objectStoreRequest.onsuccess = function(event) {

          var myRecord = objectStoreRequest.result;
          loadedmodel = myRecord;
          loadedmodel.metadata = transferRecognizer.wordLabels();
          console.log(loadedmodel);

          localStorage.setItem(document.getElementById("transfer-model-name").value, JSON.stringify(loadedmodel));
          console.log(myRecord);
          
          var modelStringify = JSON.stringify(myRecord);
          console.log(modelStringify);
        
          var _parse = JSON.parse(modelStringify);
          console.log(_parse);
          
          /*var _modelStringify = JSON.stringify(Array.from(new Int32Array(myRecord.modelArtifacts.weightData)));
          console.log(_modelStringify);
          var __modelStringify = StringToArrayBuffer(_modelStringify);
          console.log(__modelStringify);*/

          const uploadFile = (fileName) => {

            const params = {
                Bucket: 'xperimusmodels/Models',
                Key: document.getElementById('transfer-model-name').value,//'my-model',//`xperimus-${getDateString()}`, 
                ACL: 'public-read',
                Body: fileName
            };

            s3.upload(params, function(err, data) {
                if (err) {
                    throw err;
                }
                console.log(`File uploaded successfully. ${data.Location}`);
            });
          };
          uploadFile(myRecord);
          listAmazonObjects();
        };
      }
      getData();

    }

}
  
deleteTransferModelButton.addEventListener('click', async () => {
  transferModelNameInput.value = "";
  SpeechCommands.deleteSavedTransferModel(transferRecognizer.name);
  transferRecognizer = "";
});




/**
 * Log a message to a textarea.
 *
 * @param {string} message Message to be logged.
 */
function logToStatusDisplay(message) {
    const date = new Date();
    statusDisplay.value += `[${date.toISOString()}] ` + message + '\n';
    statusDisplay.scrollTop = statusDisplay.scrollHeight;
}

var candidateWordSpans;
var _candidateWordSpans;
/**
 * Display candidate words in the UI.
 *
 * The background-noise "word" will be omitted.
 *
 * @param {*} words Candidate words.
 */
var _word, btnColor = false;
function populateCandidateWords(words) {
  document.getElementById("candidate-words").innerHTML = "";
    candidateWordSpans = {};
    _candidateWordSpans = {};

    var existingDirectChildrenDivCount = $('#cont4 > div').size();
    console.log(existingDirectChildrenDivCount);
  
    for (const word of words) {
      if (word === BACKGROUND_NOISE_TAG || word === UNKNOWN_TAG) {
        continue;
      }
      _word = word;
      const wordSpan = document.createElement('div');
      wordSpan.textContent = word;
      wordSpan.classList.add('candidate-word');
      //document.getElementById("cont4").appendChild(wordSpan);
      candidateWordSpans[word] = wordSpan;
      const _button = document.createElement("button");
      _button.style['position'] = 'absolute';
      _button.style['left'] = '100%';
      _button.style['top'] = '-1px';
      _button.style['backgroundColor'] = 'rgba(32,32,32,1)';
      _button.style['border-top-right-radius'] = '2px';
      _button.style['border-bottom-right-radius'] = '2px';

      _button.style['border'] = '1px solid black';
      _button.style['width'] = '20%';
      _button.style['height'] = 'calc(100% + 2px)';
      _button.setAttribute("id", word);
      console.log(_button.style.backgroundColor);
      var newColor;
      _button.onclick = function() { 
        if (_button.classList.contains("buttonBack1") != true) {
          _button.classList.add("buttonBack1");
          console.log(_button.id);
          _btnsArray.push(_button.id);

        } else {
          _button.classList.remove("buttonBack1");
          _btnsArray = _btnsArray.filter(e => e !== _button.id);
        }
      };

      wordSpan.appendChild(_button);
      candidateWordsContainer.appendChild(wordSpan);

      const _wordSpanDiv = document.createElement('div');
      //_wordSpanDiv.id = "sendannotbtn";
      _wordSpanDiv.classList.add("bufferworddiv");
      _wordSpanDiv.textContent = _word;
      document.getElementById("micdiv").appendChild(_wordSpanDiv);

      const _wordDivBuffer = document.createElement('select');
      _wordDivBuffer.classList.add("bufferworddiv2");
      _wordDivBuffer.id = _word;
      document.getElementById("micdiv").appendChild(_wordDivBuffer);
      var opt = document.createElement("option");
      opt.text = "random";
      _wordDivBuffer.add(opt);
        for (let i = 0; i < bufferStruct.length; i++) {
          var option = document.createElement("option");
          option.text = bufferStruct[i];
          _wordDivBuffer.add(option);
          if (bufferStruct[i].length > 3) {
            console.log(bufferStruct[i]);
            for (let j = 3; j < bufferStruct[i].length; j++) {
              var newopt = document.createElement("option");
              newopt.text = "Time Slice " + bufferStruct[i][0] + " + " + bufferStruct[i][j];
              _wordDivBuffer.add(newopt); 
            }
          }
        }
    }
}



/**
 * Plot top-K predictions from a speech command recognizer.
 *
 * @param {HTMLCanvasElement} canvas The canvas to render the predictions in.
 * @param {string[]} candidateWords Candidate word array.
 * @param {Float32Array | number[]} probabilities Probability scores from the
 *   speech command recognizer. Must be of the same length as `candidateWords`.
 * @param {number} timeToLiveMillis Optional time to live for the active label
 *   highlighting. If not provided, will the highlighting will live
 *   indefinitely till the next highlighting.
 * @param {number} topK Top _ scores to render.
 */

var truthChain = new Array(3);
for (var i = 0; i < truthChain.length; ++i) { truthChain[i] = false; } 

var _btnsArray = [];
var _detectnr = 1;

function plotPredictions( canvas, candidateWords, probabilities, topK, timeToLiveMillis) {
  if (topK != null) {
    let wordsAndProbs = [];
    for (let i = 0; i < candidateWords.length; ++i) {
      wordsAndProbs.push([candidateWords[i], probabilities[i]]);
    }
    wordsAndProbs.sort((a, b) => (b[1] - a[1]));
    wordsAndProbs = wordsAndProbs.slice(0, topK);
    candidateWords = wordsAndProbs.map(item => item[0]);
    probabilities = wordsAndProbs.map(item => item[1]);

    // Highlight the top word.
    const topWord = wordsAndProbs[0][0];
    var time = new Date();
    detection_Object.push( `[${_detectnr}] [ Sound Name = "${topWord}"] - [ Probability = ${wordsAndProbs[0][1].toFixed(6)}] @ ` + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds());
    _detectnr++;
    var prob_ = wordsAndProbs[0][1].toFixed(2);
    document.getElementById('probabil').innerHTML = `"${topWord}" ${prob_}` //@ ` + new Date().toTimeString();


    const _recordDiv = document.createElement("div");
    _recordDiv.style['width'] = "10%";
    _recordDiv.style['font-size'] = "8px";
    _recordDiv.style['border'] = "1px solid black";
    _recordDiv.style['border-radius'] = "2px";
    _recordDiv.style['padding-top'] = "1%";
    _recordDiv.style['padding-left'] = "1%";
    _recordDiv.style['padding-right'] = "1%";

    _recordDiv.style['margin-top'] = "1%";
    _recordDiv.style['margin-left'] = "1%";

    _recordDiv.style['height'] = "78%";
    _recordDiv.style['background-color'] = "#353535";
    _recordDiv.style['float'] = "left";

    _recordDiv.innerHTML = `Word: "${topWord}" <br> Prob: ${wordsAndProbs[0][1].toFixed(2)} <br> Time: ` + new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds()
    const _directionArray = document.getElementById("detection-array");
    //_directionArray.appendChild(_recordDiv); stoped

    if (_btnsArray.includes(topWord) && detectOnFile == true) {
      socket.emit("play-on-detect-file", "-")

    }
    if (_btnsArray.includes(topWord) && detectOnWorklet == true) {
      socket.emit("play-on-detect-worklet", "-")

    }
/*
    ///var hasButtonClick = candidateWordsContainer.querySelector(topWord) != null;
    if (prob_ > 0.9 && topWord == "one") {
      //document.getElementById("sequence1").style.backgroundColor = "green";
      truthChain[0] = true;
      console.log(truthChain);
    }
    if (prob_ > 0.9 && topWord == "two" && truthChain[0] == true) {
      //document.getElementById("sequence2").style.backgroundColor = "green";
      truthChain[1] = true;
      console.log(truthChain);
    }
    if (prob_ > 0.9 && topWord == "three" && truthChain[1] == true) {
      //document.getElementById("sequence3").style.backgroundColor = "green";
      truthChain[2] = true;
      console.log("found song!");
    }*/

    for (const word in candidateWordSpans) {

      if (word === topWord) {
        candidateWordSpans[word].classList.add('candidate-word-active');

        if (timeToLiveMillis != null) {
          setTimeout(() => {
            if (candidateWordSpans[word]) {
              candidateWordSpans[word].classList.remove(
                  'candidate-word-active');
            }
          }, timeToLiveMillis);
        }
      } else {
        candidateWordSpans[word].classList.remove('candidate-word-active');
      }
    }
  }
}

includeWavForm.addEventListener('click', () => {
  if (includeAudioWaveformSpec == false) {
    includeAudioWaveformSpec = true;
    blinkButtons("include-wav");
  }
  else if (includeAudioWaveformSpec == true) {
    includeAudioWaveformSpec = false;
    blinkButtons("include-wav");
  }
});

mixNoiseDataset.addEventListener('click', () => {
  if (augmentNoise == false) {
    augmentNoise = true;
    blinkButtons("mixnoise");
  }
  else if (augmentNoise == true) {
    augmentNoise = false;
    blinkButtons("mixnoise");
  }
});

document.getElementById('upload-dataset').onclick = function() {
  document.getElementById('dataset-file-input').click();
};

document.getElementById('audiofile').onclick = function() {
  document.getElementById('audio-file').click();
};


var newModelWords;
async function loadFile(file) {
  let text = await file.text();
  var e_ = file.name;
  var e__ = e_.replace('-metadata', '');
  console.log(e__);
  newModelWords = text;
  loadNewModelAfterWords(newModelWords, e__);
}

async function loadNewModelAfterWords(v, v_) {
  await recognizer.ensureModelLoaded();
  transferRecognizer = recognizer.createTransfer("newloaded");

  //transferRecognizer.load(`downloads://${v_}`);
  transferModelNameInput.value = loadedModelName;

  var obj = JSON.parse(v);
  console.log(obj);
  //obj = transferRecognizer.wordLabels().join(',');
  transferRecognizer.words = obj;
  console.log(transferRecognizer);
  
  //learnWordsInput.value = transferRecognizer.wordLabels().join(',');
  loadTransferModelButton.textContent = 'Model loaded!';  
}

document.getElementById("dataset-file-input").addEventListener('change', function(e){ 
  const files = datasetFileInput.files;
  if (files == null || files.length !== 1) {
      throw new Error('Must select exactly one file.');
  }
  const datasetFileReader = new FileReader();
  datasetFileReader.onload = async event => {
      try {
          await loadDatasetInTransferRecognizer(event.target.result);
      } catch (err) {
          const originalTextContent = uploadFilesButton.textContent;
          uploadFilesButton.textContent = err.message;
          setTimeout(() => {
              uploadFilesButton.textContent = originalTextContent;
          }, 2000);
      }
      durationMultiplierSelect.value = `${transferDurationMultiplier}`;
      durationMultiplierSelect.disabled = true;
      enterLearnWordsButton.disabled = true;
  };
  datasetFileReader.onerror = () => console.error(`Failed to binary data from file '${dataFile.name}'.`);
  datasetFileReader.readAsArrayBuffer(files[0]);
}, false);


/*
x2
document.getElementById("my_file").addEventListener('change', function(e){
  var file = this.files[0];
  if (file) {
      var reader = new FileReader();
      
      reader.onload = function (evt) {
          // Create a Blob providing as first argument a typed array with the file buffer
          var blob = new window.Blob([new Uint8Array(evt.target.result)]);

          // Load the blob into Wavesurfer
          let audio = new Audio();
          audio.src = URL.createObjectURL(blob);
          wavesurfer.load(audio);


      };

      reader.onerror = function (evt) {
          console.error("An error ocurred reading the file: ", evt);
      };

      // Read File as an ArrayBuffer
      reader.readAsArrayBuffer(file);
  }
}, false);

*/

var li;
var myCodeMirror, codeCanvas;
codeCanvas = document.getElementById('draw-canvas');
var interfaceMode = true;

myCodeMirror = new CodeMirror(document.getElementById('editor-div'), {
  lineNumbers: true,
  matchBrackets: true,
  value: "/* Sttera Connection Editor */ \n\n/*\n * Sttera.NewRoom('rooms');\n * Sttera.DeleteRoom('rooms');\n * Sttera.SendData('type', secs);\n * Sttera.StopSend();\n * Sttera.PingConnectedUsers();\n * Sttera.GetPlayers();\n\n * Sttera.Connect('rooms')\n * Sttera.Disconnect('rooms')\n * Sttera.ParticipateWithID()\n*/",//"/** Sttera Connection Editor */ \n\nfunction setup() { \n  createCanvas(400, 400);\n}\n\nfunction callback() {\n  background(200); \n}",
  styleActiveLine: true,
  mode:  "javascript",
  theme: "mbo",
});      

/*var _run = document.getElementById('editor-div');
_run.addEventListener('click', () => {
  runcode();
});*/


//just create the matrix now
/*
if (typeof console  != "undefined") 
    if (typeof console.log != 'undefined')
        console.olog = console.log;
    else
        console.olog = function() {};

console.log = function(message) {
    console.olog(message);
    if ($('#consoletext') != null) {
      $('#consoletext').append(message + '<br>');//'<p>' + message + '</p>');
    }
};
console.error = console.debug = console.info = console.log*/


//change this to upper scope
var loadedModelName, loadedModelName1;
/*
if (document.addEventListener){
  document.addEventListener("click", function(event){
      var targetElement = event.target || event.srcElement;
      console.log(targetElement);
  });
}*/

$(document).click(function(event) {

  var text = $(event.target).text();
  if (text.includes("Models/") == true && !text.includes("Trained") && !text.includes("metadata") && !text.includes("weights")) {
    loadedModelName = text.replace('Models/','');
    transactedAmazonModel = loadedModelName;
    getmodels(text);
  }
  if (text.includes("Datasets/") == true && !text.includes("Recorded")) {
    loadedModelName1 = text.replace('Datasets/','');
    transactedAmazonModel1 = loadedModelName1;
    getdatasets(text);
  }
});

async function getdatasets(v) {
  console.log(v);
  var params = {
    Bucket: "xperimusmodels", 
    Key: v, 
    //Range: "bytes=0-9"
   };
   s3.getObject(params, function(err, data) {
    if (err) console.log(err, err.stack); 
    else     console.log(data);  
    //var __e = data.Body.toString();
    //var _dname = `Datasets/${v_}.weights.bin`
    window.open(`https://xperimusmodels.s3.eu-west-2.amazonaws.com/${v}`, '_blank'); 
 });
}

async function getmodels(v) {
  var params = {
    Bucket: "xperimusmodels", 
    Key: v, 
    //Range: "bytes=0-9"
   };
  s3.getObject(params, function(err, data) {
     if (err) console.log(err, err.stack); 
     else     console.log(data);           
     //document.location = 'data:audio/midi;base64,' + btoa(file.toBytes());
     var __e = data.Body.toString();
     console.log(__e);
    var _e = JSON.parse(__e);
    //_e.metadata = recornizer.;
    console.log(_e); 
    var __v = v.replace('Models/','');

    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(__e));
    var dlAnchorElem = document.getElementById('downloadAnchorElem');
    dlAnchorElem.setAttribute("href",     dataStr     );
    dlAnchorElem.setAttribute("download", __v);
    dlAnchorElem.click();
    getSameModelMetadata(__v);

    _well(_e);
    
  });
}

async function getSameModelMetadata(v) {
  var v_ = v.replace('.json','');
  var _key = `Models/${v_}-metadata.json`
  var _sname = `${v_}-metadata.json`
  var params = {
    Bucket: "xperimusmodels", 
    Key: _key, 
   };
  s3.getObject(params, function(err, data) {
     if (err) console.log(err, err.stack); 
     else     console.log(data);           
     var __e = data.Body.toString();
     /*console.log(__e);
     var _e = JSON.parse(__e);
     //_e.metadata = recornizer.;
     console.log(_e);*/

    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(__e));
    var dlAnchorElem = document.getElementById('downloadAnchorElem');
    dlAnchorElem.setAttribute("href",     dataStr     );
    dlAnchorElem.setAttribute("download", _sname);
    dlAnchorElem.click();

    var _wname = `Models/${v_}.weights.bin`
    window.open(`https://xperimusmodels.s3.eu-west-2.amazonaws.com/${_wname}`, '_blank');
    
  });
}


var _metadata;
async function _well(v) {
  console.log(v);
  var DBOpenRequest = window.indexedDB.open("tensorflowjs", dbVersion);
  DBOpenRequest.onupgradeneeded = function(event) {
    var db = event.target.result;
    var objectStore = db.createObjectStore("models_store", { keyPath: "modelPath" });
    _metadata = v.metadata;
    delete v["metadata"];
    objectStore.add(v);
    __well(v, _metadata);
  }
}

async function __well(v, metadata_) {
  
  await recognizer.ensureModelLoaded();
  //await tf.loadLayersModel('indexeddb//my-model');
  transferRecognizer = recognizer.createTransfer(loadedModelName);
  console.log(loadedModelName);
  transferRecognizer.load(`indexeddb://${loadedModelName}`);
  
  transferModelNameInput.value = loadedModelName;
  //v.metadata = transferRecognizer.wordLabels().join(',');
  transferRecognizer.words = metadata_;
  //learnWordsInput.value = transferRecognizer.wordLabels().join(',');
  loadTransferModelButton.textContent = 'Model loaded!';  
}


function StringToArrayBuffer(string) {
  return StringToUint8Array(string).buffer;
}

function StringToBinary(string) {
  var chars, code, i, isUCS2, len, _i;

  len = string.length;
  chars = [];
  isUCS2 = false;
  for (i = _i = 0; 0 <= len ? _i < len : _i > len; i = 0 <= len ? ++_i : --_i) {
      code = String.prototype.charCodeAt.call(string, i);
      if (code > 255) {
          isUCS2 = true;
          chars = null;
          break;
      } else {
          chars.push(code);
      }
  }
  if (isUCS2 === true) {
      return unescape(encodeURIComponent(string));
  } else {
      return String.fromCharCode.apply(null, Array.prototype.slice.apply(chars));
  }
}

function StringToUint8Array(string) {
  var binary, binLen, buffer, chars, i, _i;
  binary = StringToBinary(string);
  binLen = binary.length;
  buffer = new ArrayBuffer(binLen);
  chars  = new Uint8Array(buffer);
  for (i = _i = 0; 0 <= binLen ? _i < binLen : _i > binLen; i = 0 <= binLen ? ++_i : --_i) {
      chars[i] = String.prototype.charCodeAt.call(binary, i);
  }
  return chars;
}


async function sendingDataSockets() {

  if (_isMobile == true) {
    _isMobile = false;
    var _a = document.getElementById("streamButton");
    _a.style['backgroundColor'] = 'rgba(32,32,32,1)';
  }
  else if (_isMobile == false) {
    _isMobile = true;
    var _a = document.getElementById("streamButton");
    _a.style['backgroundColor'] = 'rgba(38,165,164,1)';
  }
  console.log(_isMobile);
}

var buttonIDDownload = 0;
document.getElementById('load-transfer-model').onclick = function() {
  modalContent.innerHTML = "";

  s3.listObjects(function (err, data) {
    if(err)throw err;
    //var e = data.Contents[0].Key;
    var e = data.Contents
    var _e = JSON.stringify(e);
  
    Object.keys(e).forEach((key, index) => {  
      if (e[key].Key.includes("Models") == true && !e[key].Key.includes("metadata") && !e[key].Key.includes("weights") && e[key].Key.includes(".json")) {

        var button = document.createElement("button");
        button.style["height"] = "10%"; 
        button.style["overflow"] = "auto"; 
        button.style["position"] = "relative"; 
        button.style["width"] = "60%"; 
        button.style["left"] = "20%"; 
        button.style["top"] = "30%"; 
        button.style["text-align"] = "center"; 
        button.style["background-color"] = "rgba(42,42,42,1)"; 
        button.style["border-radius"] = "3px"; 
        button.style["border"] = "1px solid #888"; 
        button.style["color"] = "grey"; 
        button.id = buttonIDDownload;
        button.onclick = downloadFilesDirectly;

        var e_ = e[key].Key.replace("Models/", "");
        var e__ = e_.replace(".json", "");
        button.innerHTML = e__;
        modalContent.appendChild(button);
      }
      buttonIDDownload++;
    });
  });

  //wordDiv.style['margin'] = '2px';

  /*ar $el_ = $('#cont11').clone(true, true).appendTo('#modal-content');
  
  $el_.css({position:'absolute', width: '60%', top: 200, left: '20%', backgroundColor: 'red'});
  $el_.children().attr( "onclick", null );
  var children = $el_.children();
  for (var i = 0; i < children.length; i++) {
    var tableChild = children[i];
    var e = tableChild.innerHTML.replace("Models/", "");
    var e_ = tableChild.innerHTML.replace(".json", "");
    if (tableChild.innerHTML.includes("metadata")) {

    }
    tableChild.innerHTML = _e;
    console.log(tableChild.innerHTML);
  }

  console.log($el_.children());*/
  modal.style.display = "block";
};

var newArrayOfNames;
function reqListener () {
  var _e = JSON.parse(this.responseText);
  newArrayOfNames = _e;
}



async function downloadFilesDirectly() {
  var oReq = new XMLHttpRequest();
  oReq.addEventListener("load", reqListener);
  oReq.open("GET", `https://xperimusmodels.s3.eu-west-2.amazonaws.com/Models/${event.srcElement.innerHTML}-metadata.json`, false );
  oReq.send();
  transferRecognizer = recognizer.createTransfer(event.srcElement.innerHTML);
  transferRecognizer.words = newArrayOfNames; // .words 
  transferRecognizer.load(`https://xperimusmodels.s3.eu-west-2.amazonaws.com/Models/${event.srcElement.innerHTML}.json`);

  modal.style.display = "none";

}


span.onclick = function() {
  console.log("works");
  modal.style.display = "none";
}
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}


var c = document.getElementById("door");
var ctx = c.getContext("2d");
ctx.beginPath();
ctx.lineWidth = 4;
ctx.arc(0, 130, 90, 10, 2 * Math.PI);
ctx.fillStyle = 'rgba(32,32,32,1)';
ctx.fill();
ctx.lineTo(0, 130);
ctx.strokeStyle = 'black';
ctx.stroke();

function blinkSender() {
  if ($('#socketblink').length > 0) {
    document.getElementById('socketblink').style['background-color'] = "red";
    setTimeout(function(){
      document.getElementById('socketblink').style['background-color'] = "#2c2c2c";
    }, 70)
  }
}

function blinkReceiver() {
  if ($('#socketblinkrcv').length > 0) {
    document.getElementById('socketblinkrcv').style['background-color'] = "green";
    setTimeout(function(){
      document.getElementById('socketblinkrcv').style['background-color'] = "#2c2c2c";
    }, 70)
  }
}

//var isStreamingOnDetect = false;
//var isStreamingOnWavesurfer = false;
/*
var _triggerOnDetect = document.getElementById('trigger-when-mic');
_triggerOnDetect.addEventListener('click', () => {
  if (isStreamingOnDetect == true) {
    isStreamingOnDetect = false;
    _triggerOnDetect.style["background-color"] = "rgba(52,52,52,1)";
    _triggerOnDetect.style["color"] = "rgba(200,200,200,1)";
  } else if (isStreamingOnDetect == false){
    isStreamingOnDetect = true;
    _triggerOnDetect.style["background-color"] = "rgba(38,165,164,1)";
    _triggerOnDetect.style["color"] = "black";
  }
});

var _triggerWaveOnDetect = document.getElementById('trigger-when-play');
_triggerWaveOnDetect.addEventListener('click', () => {
  if (isStreamingOnWavesurfer == true) {
    isStreamingOnWavesurfer = false;
    _triggerWaveOnDetect.style["background-color"] = "rgba(52,52,52,1)";
    _triggerWaveOnDetect.style["color"] = "rgba(200,200,200,1)";
  } else if (isStreamingOnWavesurfer == false){
    isStreamingOnWavesurfer = true;
    _triggerWaveOnDetect.style["background-color"] = "rgba(38,165,164,1)";
    _triggerWaveOnDetect.style["color"] = "black";
  }
});
*/
var _stopConnect = document.getElementById('stop-room-connect');
_stopConnect.addEventListener('click', () => {
  if (isRecruiting == false) {
    isRecruiting = true;
    _stopConnect.style["background-color"] = "rgba(52,52,52,1)";
    _stopConnect.style["color"] = "rgba(200,200,200,1)";
  } else if (isRecruiting == true){
    isRecruiting = false;
    _stopConnect.style["background-color"] = "rgba(38,165,164,1)";
    _stopConnect.style["color"] = "black";
  }
  console.log(isRecruiting);
});
