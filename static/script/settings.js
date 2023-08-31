function getData(){

    fetch('/config')

    .then(response => response.json())
    .then(data=>{
    
        if(data.status != 200){
            console.log("Get data error - " + data.error + " | " + data.status);
        }else{
            data = data.data;

            pondhigh = document.getElementById("pondHigh");
            pondLow = document.getElementById("pondLow");
            pondAlert = document.getElementById("pondAlert");
            pondDFB = document.getElementById("pondDFB");
            pondRuns = document.getElementById("pondRuns");

            innerHigh = document.getElementById("innerHigh");
            innerLow = document.getElementById("innerLow");
            innerAlert = document.getElementById("innerAlert");
            innerDFB = document.getElementById("innerDFB");
            innerRuns = document.getElementById("innerRuns");

            outerHigh = document.getElementById("outerHigh");
            outerLow = document.getElementById("outerLow");
            outerAlert = document.getElementById("outerAlert");
            outerDFB = document.getElementById("outerDFB");
            outerRuns = document.getElementById("outerRuns");

            tubHigh = document.getElementById("tubHigh");
            tubLow = document.getElementById("tubLow");
            tubAlert = document.getElementById("tubAlert");
            tubDFB = document.getElementById("tubDFB");
            tubRuns = document.getElementById("tubRuns");

            nPumpOff = document.getElementById("nPumpOff");
            nPumpOn = document.getElementById("nPumpOn");
            nPumpDelay = document.getElementById("nPumpDelay");

            tPumpOff = document.getElementById("tPumpOff");
            tPumpOn = document.getElementById("tPumpOn");
            tPumpDelay = document.getElementById("tPumpDelay");

            pondHighCheck = document.getElementById("pondHighCheck");
            pondLowCheck = document.getElementById("pondLowCheck");
            pondOkCheck = document.getElementById("pondOkCheck");

            monday = document.getElementById("monday");
            tuesday = document.getElementById("tuesday");
            wednesday = document.getElementById("wednesday");
            thursday = document.getElementById("thursday");
            friday = document.getElementById("friday");
            saturday = document.getElementById("saturday");
            sunday = document.getElementById("sunday");

            cleaningTime = document.getElementById("cleaningTime");
            cleaningDuration = document.getElementById("cleaningDuration");
            cleaningLevelBounce = document.getElementById("cleaningLevelBounce");

            refill = document.getElementById("refill");

            pondhigh.value = data['waterLevels']['pond']['high'];
            pondLow.value = data['waterLevels']['pond']['low'];
            pondAlert.value = data['warningTimes']['pond'];
            pondDFB.value = data['sensorData']['pond']['DFB'];
            pondRuns.value = data['sensorData']['pond']['runs'];

            innerHigh.value = data['waterLevels']['nexusInner']['high'];
            innerLow.value = data['waterLevels']['nexusInner']['low'];
            innerAlert.value = data['warningTimes']['nexusInner'];
            innerDFB.value = data['sensorData']['nexusInnerLevel']['DFB'];
            innerRuns.value = data['sensorData']['nexusInnerLevel']['runs'];

            outerHigh.value = data['waterLevels']['nexusOuter']['high'];
            outerLow.value = data['waterLevels']['nexusOuter']['low'];
            outerAlert.value = data['warningTimes']['nexusOuter'];
            outerDFB.value = data['sensorData']['nexusOuterLevel']['DFB'];
            outerRuns.value = data['sensorData']['nexusOuterLevel']['runs'];

            tubHigh.value = data['waterLevels']['tub']['high'];
            tubLow.value = data['waterLevels']['tub']['low'];
            tubAlert.value = data['warningTimes']['tub'];
            tubDFB.value = data['sensorData']['tubLevel']['DFB'];
            tubRuns.value = data['sensorData']['tubLevel']['runs'];

            nPumpOff.value = data['pumpControl']['nexusValues']['off'];
            nPumpOn.value = data['pumpControl']['nexusValues']['on'];
            nPumpDelay.value = data['pumpControl']['nexusValues']['delay'];

            tPumpOff.value = data['pumpControl']['tubValues']['off'];
            tPumpOn.value = data['pumpControl']['tubValues']['on'];
            tPumpDelay.value = data['pumpControl']['tubValues']['delay'];

            pondHighCheck.value = data['waterLevels']['levelCheck']['pond']['high'];
            pondLowCheck.value = data['waterLevels']['levelCheck']['pond']['low'];
            pondOkCheck.value = data['waterLevels']['levelCheck']['pond']['ok'];
            
            
            if (data['cleaning']['schedule']['Monday'] === 'true'){
                monday.checked = true;
            }else{
                monday.checked = false;
            }
            if (data['cleaning']['schedule']['Tuesday'] === 'true'){
                tuesday.checked = true;
            }else{
                tuesday.checked = false;
            }
            if (data['cleaning']['schedule']['Wednesday'] === 'true'){
                wednesday.checked = true;
            }else{
                wednesday.checked = false;
            }
            if (data['cleaning']['schedule']['Thursday'] === 'true'){
                thursday.checked = true;
            }else{
                thursday.checked = false;
            }
            if (data['cleaning']['schedule']['Friday'] === 'true'){
                friday.checked = true;
            }else{
                friday.checked = false;
            }
            if (data['cleaning']['schedule']['Saturday'] === 'true'){
                saturday.checked = true;
            }else{
                saturday.checked = false;
            }
            if (data['cleaning']['schedule']['Sunday'] === 'true'){
                sunday.checked = true;
            }else{
                sunday.checked = false;
            }
            if (data['waterLevels']['levelCheck']['refill'] === true){
                refill.checked = true;
            }else{
                refill.checked = false;
            }

            cleaningTime.value = data['cleaning']['time']
            cleaningDuration.value = data['cleaning']['duration']
            cleaningLevelBounce.value = data['cleaning']['levelBounce']
        }
    })
}

function updateJson(){
    const values = ['pondHigh', 'pondLow', 'pondAlert', 'innerHigh', 'innerLow', 'innerAlert', 'outerHigh', 'outerLow', 'outerAlert', 'tubHigh', 'tubLow', 'tubAlert', 'pondDFB', 'pondRuns', 'innerDFB', 'innerRuns', 'outerDFB', 'outerRuns', 'tubDFB', 'tubRuns', 'nPumpOff', 'nPumpOn', 'nPumpDelay', 'tPumpOff', 'tPumpOn', 'tPumpDelay', 'pondHighCheck', 'pondLowCheck', 'pondOkCheck', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'cleaningTime', 'cleaningDuration', 'cleaningLevelBounce', 'refill']

    let data = [];

    for (let value in values){
        let element = document.getElementById(values[value])
        let selectValue = element.value;
        if (element.type === 'checkbox'){
            if (element.checked) {
                selectValue = true
            }else {
                selectValue = false
            }
        }
        data.push(selectValue);
    }

    console.log(data)
    let url = "/process-data"
    let xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
        let strResponse = "Error: no response";
        if (this.readyState == 4 && this.status == 200) {
            strResponse = JSON.parse(this.responseText);
            if (strResponse.status != 200){
                alert("Failed to update")
                console.log("Update json error - " + strResponse.data + " | " + strResponse.status);
            } else {
                alert("Updated json!")
                window.location.replace("/");
            }
        }
    };
    xhttp.open("PUT", url, true);
    // Converting JSON data to string
    var dataSend = JSON.stringify(data);
    // Set the request header i.e. which type of content you are sending
    xhttp.setRequestHeader("Content-Type", "application/json");
    //send it
    xhttp.send(dataSend);

}

setTimeout(() => {
    getData()
  }, 1000);