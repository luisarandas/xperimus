document.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem("is_reloaded")) alert('Reloaded!');

    /* Interesting to monitor

    function print_nav_timing_data() {
    // Use getEntriesByType() to just get the "navigation" events
     var perfEntries = performance.getEntriesByType("navigation");

     for (var i=0; i < perfEntries.length; i++) {
    console.log("= Navigation entry[" + i + "]");
    var p = perfEntries[i];
    // dom Properties
    console.log("DOM content loaded = " + (p.domContentLoadedEventEnd - p.domContentLoadedEventStart));
    console.log("DOM complete = " + p.domComplete);
    console.log("DOM interactive = " + p.interactive);

    // document load and unload time
    console.log("document load = " + (p.loadEventEnd - p.loadEventStart));
    console.log("document unload = " + (p.unloadEventEnd - p.unloadEventStart));

    // other properties
    console.log("type = " + p.type);
    console.log("redirectCount = " + p.redirectCount);
     }
    }
    */ 
});

document.addEventListener("DOMContentLoaded", () => {

    //var audioCtx = new AudioContext();
    // Check properties of the context.

    sniffNetwork();

    document.getElementById("1").addEventListener("click", function () {
        console.log("Listener on Button!");
    });

    document.getElementById("2").addEventListener("click", function () {
        console.log(audioCtx);
    });

    function sniffNetwork(){
        console.log("Print here network properties.");
    }
});

