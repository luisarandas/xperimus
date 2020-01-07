const audioContext = new AudioContext();
//Now we need to have the audio context take control of your HTML Audio Element.

// Select the Audio Element from the DOM
const htmlAudioElement = document.getElementById("audio");
// Create an "Audio Node" from the Audio Element
const source = audioContext.createMediaElementSource(htmlAudioElement);
// Connect the Audio Node to your speakers. Now that the audio lives in the
// Audio Context, you have to explicitly connect it to the speakers in order to
// hear it
source.connect(audioContext.destination);

console.log("ctx done");

const levelRangeElement = document.getElementById("levelRange");

let mfcc_feature = [];

const chroma1 = document.getElementById("chroma1");
const chroma2 = document.getElementById("chroma2");
const chroma3 = document.getElementById("chroma3");
const chroma4 = document.getElementById("chroma4");
const chroma5 = document.getElementById("chroma5");
const chroma6 = document.getElementById("chroma6");
const chroma7 = document.getElementById("chroma7");
const chroma8 = document.getElementById("chroma8");
const chroma9 = document.getElementById("chroma9");
const chroma10 = document.getElementById("chroma10");
const chroma11 = document.getElementById("chroma11");
const chroma12 = document.getElementById("chroma12");

if (typeof Meyda === "undefined"){
    console.log("Meyda could not be found! Have you included it?");
} else {
    console.log(Meyda);
    // O callback do analyser esta ligado a source do actx
    const analyzer = Meyda.createMeydaAnalyzer({
        "audioContext": audioContext,
        "source": source,
        "bufferSize": 512,
        "featureExtractors": ["rms", "energy", "amplitudeSpectrum", "chroma"],
        "callback": features => {
            //console.log("RMS " + features.rms);
            //console.log("Energy " + features.energy);
            levelRangeElement.value = features.rms;
            chroma1.value = features.chroma[0];
            chroma2.value = features.chroma[1];
            chroma3.value = features.chroma[2];
            chroma4.value = features.chroma[3];
            chroma5.value = features.chroma[4];
            chroma6.value = features.chroma[5];
            chroma7.value = features.chroma[6];
            chroma8.value = features.chroma[7];
            chroma9.value = features.chroma[8];
            chroma10.value = features.chroma[9];
            chroma11.value = features.chroma[10];
            chroma12.value = features.chroma[11];
        }
    });
    analyzer.start();
}

console.log("ola");

/* Test MMLL */

// Agora correlacionar o RMS e o Onset Detection com a nota - 
// Codificar uma progressão harmónica algoritmicamente

"use strict";
var i;
var audioblocksize = 256;
var chorddetector;
var onsetdetector;

var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");

var setup = function SetUp(sampleRate){
    console.log("Setting Up!");
    onsetdetector = new MMLLOnsetDetector(sampleRate);
    chorddetector = new MMLLChordDetector(sampleRate,2,0.5);
};

var callback = function CallBack(input, output, n){
    var chord = chorddetector.next(input.monoinput);
    console.log("chord", chord);
    document.getElementById('chordText').innerHTML = "Detected " + chord;

    var detection = onsetdetector.next(input.monoinput);
    if (detection) {
        console.log("Onset now!");
        var randomcolor = "rgb(" +(Math.floor(Math.random()*255.9999))+ "," +(Math.floor(Math.random()*255.9999))+ "," +(Math.floor(Math.random()*255.9999))+ ")";
        context.fillStyle = randomcolor;
        context.fillRect(0,0,canvas.width,canvas.height);
    }

    for (i=0; i<n; i++){
        output.outputL[i] = input.inputL[i];
        output.outputR[i] = input.inputR[i];
    }
};

function setThreshold(newValue){
    var threshold = parseFloat(newValue)*0.01;
    onsetdetector.threshold = threshold;
}

var gui = new MMLLBasicGUISetup(callback,setup,audioblocksize,true,true);

function setKeyDecay(newValue) {
    chorddetector.keydecay = parseFloat(newValue)*0.1;
}

function setChromaLeak(newValue) {
    chorddetector.chromaleak = parseFloat(newValue)*0.01;
}

/*audioContext = new window.AudioContext()
analyser = audioContext.createAnalyser();
const constraints = { audio: true, video: false };
navigator.mediaDevices.getUserMedia(constraints).then((str) => {
  const stream = str;
  source = this.audioContext.createMediaStreamSource(stream);
  source.connect(analyser);
});*/ 

/* Transfer Learning Example */
