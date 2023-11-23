function loadable(){
    // Check if the internet is connected
    if (navigator.onLine == false) {
        // Show a message
        document.getElementById("status").innerHTML = "Disconnected";
        document.getElementById("status").style.color = "grey";
    }else {
        getCurrentData();
        getStatus();
        getPondStatus();
    }
};


function getStatus(){
    let statusText = document.getElementById("status");
    fetch('/systemState')

    .then(response => response.json())
    .then(data=>{
    
        if(data.status != 200){
            statusText.style.color = "#FF0044";
            statusText.innerHTML = "Crashed";
            console.log("Get status error - " + data.error + " | " + data.status);
        }else{
            if (data.error == false){
                if (data.data == true) {
                    statusText.innerHTML = "Running";
                    statusText.style.color = "#06a85c";
                } else {
                    statusText.innerHTML = "Stopped";
                    statusText.style.color = "black";
                }
            }else{
                statusText.innerHTML = "Crashed";
                statusText.style.color = "#FF0044";
                console.log("Status error - " + data.error + " | " + data.status)
            }
        }
    })
}

function getPondStatus(){
    // pondStateArray = [pondLevelState, Message, innerLevelState, Message, outerLevelState, Message, tubLevelState, Message, pondTemp, Message, waterLevel ('Low', 'Ok', 'High')]
    let statusInfo = document.getElementById("pondStatusInfo");
    let trafficInd = document.getElementById("pondStatusTraffic");
    let pond = document.getElementById("pondLevelBar");
    let inner = document.getElementById("inLevelBar");
    let outer = document.getElementById("outLevelBar");
    let tub = document.getElementById("tubLevelBar");
    let threeCheck = document.getElementById("threeCheckLevel")

    let errors = 0;
    let message = "";
    fetch('/pondState')

    .then(response => response.json())
    .then(data=>{
    
        if(data.status != 200){
            console.log("Get pond status error - " + data.error + " | " + data.status);
        }else{
            data = data.data

            if (data[10] == "Ok"){
                threeCheck.innerHTML = 'Ok'
                threeCheck.style.color = "#06a85c";
            } else if (data[10] != "Ok"){
                threeCheck.innerHTML = data[10]
                threeCheck.style.color = "#FF0044";
            }

            if (data[11]){ // Cleaning is true
                trafficInd.classList.remove("buttonWait");
                trafficInd.classList.remove("buttonFail");
                trafficInd.classList.remove("buttonComplete");
                trafficInd.classList.add("buttonInfo");
                trafficInd.innerHTML = "Cleaning";
                message += " | Until " + data[12] + " | "
                statusInfo.innerHTML = message;
            } else {
                trafficInd.classList.remove("buttonInfo");
            }

            if (data[0] == false && data[2] == false && data[4] == false && data[6] == false && data[13] == false){
                if (data[11] == false){ // Cleaning is false
                    trafficInd.classList.remove("buttonWait");
                    trafficInd.classList.remove("buttonFail");
                    trafficInd.classList.add("buttonComplete");
                    trafficInd.innerHTML = "All clear";
                    statusInfo.innerHTML = "";
                }

                pond.classList.remove("bar-alert");
                inner.classList.remove("bar-alert");
                outer.classList.remove("bar-alert");
                tub.classList.remove("bar-alert");
            }else {
                if (data[11] == false){ // Cleaning is false
                    trafficInd.classList.remove("buttonWait");
                    trafficInd.classList.remove("buttonComplete");
                    trafficInd.classList.add("buttonFail");
                    trafficInd.innerHTML = "Warning";
                }
                if (data[0]){
                    errors+=1;
                    message += "| Pond is " + data[1] + " | ";
                    pond.classList.add("bar-alert");
                }else{
                    pond.classList.remove("bar-alert");
                }
                if (data[2]){
                    errors+=1;
                    message += "| Nexus inner is " + data[3] + " | ";
                    inner.classList.add("bar-alert");
                }else{
                    inner.classList.remove("bar-alert");
                }
                if (data[4]){
                    errors+=1;
                    message += "| Nexus outer is " + data[5] + " | ";
                    outer.classList.add("bar-alert");
                }else{
                    outer.classList.remove("bar-alert");
                }
                if (data[6]){
                    errors+=1;
                    message += "| Tub is " + data[7] + " | ";
                    tub.classList.add("bar-alert");
                }else{
                    tub.classList.remove("bar-alert");
                }
                if (data[8]){
                    errors+=1;
                    message += "| Pond temp is " + data[9] + " | ";
                }
                if (data[13]){
                    errors+=1;
                    message += " | OFP | ";
                }
                statusInfo.innerHTML = message;
                trafficInd.innerHTML = errors + " Errors"
            }

        }
    })
}

function getCurrentData(){
    fetch('/currentData')

    .then(response => response.json())
    .then(data=>{
    
        if(data.status != 200){
            console.log("Get current data error - " + data.data + " | " + data.status);
        }else{
            displayCurrentData(data.data);
        };
    });
};

function displayCurrentData(data){
    // data = [refilling, nexusPump, tubPump, pondLevel, nInnerLevel, nOuterLevel, tubLevel, waterTemp, clarity?, cpuTemp, cpuFreq, usedDisk, update]
    // Array(12) [ false, true, true, 70, 40, -1, 37, 19, 0, 35.78, 800, 1.47, 13:33 ]

    const pondLevel = document.getElementById("pondLevel");
    const inLevel = document.getElementById("inLevel");
    const outLevel = document.getElementById("outLevel");
    const tubLevel = document.getElementById("tubLevel");
    const waterTemp = document.getElementById("waterTemp");
    const cpuTemp = document.getElementById("cpuTemp");
    const cpuFreq = document.getElementById("cpuFreq");
    const storage = document.getElementById("storage");

    const watering = document.getElementById("watering");
    const nexusPump = document.getElementById("nexusPump");
    const tubPump = document.getElementById("tubPump");

    const pondLevelBar = document.getElementById('pondLevelBar');
    const inLevelBar = document.getElementById('inLevelBar');
    const outLevelBar = document.getElementById('outLevelBar');
    const tubLevelBar = document.getElementById('tubLevelBar');
    const cpuTempBar = document.getElementById('cpuTempBar');
    const cpuFreqBar = document.getElementById('cpuFreqBar');
    const storageBar = document.getElementById('storageBar');

    const update = document.getElementById('update');
    update.innerHTML = data[12];

    pondLevel.innerHTML = data[3]+"cm";
    let pondLevelPer = (data[3] / 80) * 100
    pondLevelBar.dataset.value = pondLevelPer;

    inLevel.innerHTML = data[4]+"cm";
    let inLevelPer = (data[4] / 72) * 100
    inLevelBar.dataset.value = inLevelPer;

    outLevel.innerHTML = data[5]+"cm";
    let outLevelPer = (data[5] / 52) * 100
    outLevelBar.dataset.value = outLevelPer;

    tubLevel.innerHTML = data[6]+"cm";
    let tubLevelPer = (data[6] / 57) * 100
    tubLevelBar.dataset.value = tubLevelPer;

    waterTemp.innerHTML = data[7]+"°C";

    cpuTemp.innerHTML = data[9]+"°C";
    let cpuTempPer = data[9]/45 * 100;
    cpuTempBar.dataset.value = cpuTempPer;

    cpuFreq.innerHTML = data[10]+"Mhz";
    let cpuFreqPer = data[10]/1000 * 100;
    cpuFreqBar.dataset.value = cpuFreqPer;

    storage.innerHTML = data[11]+"GB";
    let storagePer = data[11]/32 * 100;
    storageBar.dataset.value = storagePer;


    const pondLevelBar_value = parseInt(pondLevelBar.getAttribute('data-value'));
    pondLevelBar.style.setProperty('--value', pondLevelBar_value);
    const inLevelBar_value = parseInt(inLevelBar.getAttribute('data-value'));
    inLevelBar.style.setProperty('--value', inLevelBar_value);
    const outLevelBar_value = parseInt(outLevelBar.getAttribute('data-value'));
    outLevelBar.style.setProperty('--value', outLevelBar_value);
    const tubLevelBar_value = parseInt(tubLevelBar.getAttribute('data-value'));
    tubLevelBar.style.setProperty('--value', tubLevelBar_value);

    const cpuTempBar_value = parseInt(cpuTempBar.getAttribute('data-value'));
    cpuTempBar.style.setProperty('--value', cpuTempBar_value);
    const cpuFreqBar_value = parseInt(cpuFreqBar.getAttribute('data-value'));
    cpuFreqBar.style.setProperty('--value', cpuFreqBar_value);
    const storageBar_value = parseInt(storageBar.getAttribute('data-value'));
    storageBar.style.setProperty('--value', storageBar_value);

    watering.innerHTML = data[0];
    
    if (data[0] != 'Off'){
        watering.classList.remove("loading");
        watering.classList.remove("on");
        watering.classList.add("off");
    } else {
        watering.classList.remove("loading");
        watering.classList.remove("off");
        watering.classList.add("on");
    }

    if (data[1] == true){
        nexusPump.innerHTML = "On";
        nexusPump.classList.remove("loading");
        nexusPump.classList.remove("off");
        nexusPump.classList.add("on");
    } else {
        nexusPump.innerHTML = "Off";
        nexusPump.classList.remove("loading");
        nexusPump.classList.remove("on");
        nexusPump.classList.add("off");
    }

    if (data[2] == true){
        tubPump.innerHTML = "On";
        tubPump.classList.remove("loading");
        tubPump.classList.remove("off");
        tubPump.classList.add("on");
    } else {
        tubPump.innerHTML = "Off";
        tubPump.classList.remove("loading");
        tubPump.classList.remove("on");
        tubPump.classList.add("off");
    }
}

function resetBtn(){
    let startBtn = document.getElementById("startBtn");
    let stopBtn = document.getElementById("stopBtn");

    startBtn.innerHTML = "Start";
    startBtn.classList.remove("buttonFail");
    startBtn.classList.remove("buttonComplete");
    startBtn.classList.remove("buttonWait");
    startBtn.classList.add("buttonOff");

    stopBtn.innerHTML = "Stop";
    stopBtn.classList.remove("buttonFail");
    stopBtn.classList.remove("buttonComplete");
    stopBtn.classList.remove("buttonWait");
    stopBtn.classList.add("buttonOff");
}

function water(value){
    let startBtn = document.getElementById("startBtn");
    let stopBtn = document.getElementById("stopBtn");

    if (value == true){
        startBtn.classList.remove("buttonComplete");
        startBtn.classList.remove("buttonOff");
        startBtn.classList.remove("buttonFail");
        startBtn.classList.add("buttonWait");
        startBtn.innerHTML = "Wait";
    } else {
        stopBtn.classList.remove("buttonComplete");
        stopBtn.classList.remove("buttonOff");
        stopBtn.classList.remove("buttonFail");
        stopBtn.classList.add("buttonWait");
        stopBtn.innerHTML = "Wait";

    }
    

    fetch('/water/' + value)

    .then(response => response.json())
    .then(data=>{
    
        if(data.status != 200){
            if (value == true){
                startBtn.classList.remove("buttonComplete");
                startBtn.classList.remove("buttonWait");
                startBtn.classList.remove("buttonOff");
                startBtn.classList.add("buttonFail");
                startBtn.innerHTML = "Failed";
            }else {
                stopBtn.classList.remove("buttonComplete");
                stopBtn.classList.remove("buttonWait");
                stopBtn.classList.remove("buttonOff");
                stopBtn.classList.add("buttonFail");
                stopBtn.innerHTML = "Failed";
            }
            console.log("Start error - " + data.data + " | " + data.status);
        }else{
            if (value == true){
                startBtn.classList.remove("buttonOff");
                startBtn.classList.remove("buttonWait");
                startBtn.classList.remove("buttonFail");
                startBtn.classList.add("buttonComplete");
                startBtn.innerHTML = "Running";
            } else {
                stopBtn.classList.remove("buttonOff");
                stopBtn.classList.remove("buttonWait");
                stopBtn.classList.remove("buttonFail");
                stopBtn.classList.add("buttonComplete");
                stopBtn.innerHTML = "Stopped";
            }
        }
        getCurrentData();
        setTimeout(() => {
            resetBtn()
          }, 3000); 
    })
    getStatus()
}

setTimeout(() => {
    loadable()
  }, 1000);
setInterval(loadable, 6000);