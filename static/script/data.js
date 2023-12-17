// Load the Visualization API and the corechart package.
google.charts.load('current', {'packages':['corechart']});

// Set a callback to run when the Google Visualization API is loaded.
google.charts.setOnLoadCallback(today);

let saveData = [];
let auto = false;

function update(){
  if (auto) {
    hour()
  }
}

function autoUpdate(){
  let button = document.getElementById("autoUpdate")
  auto = !auto;

  if (auto) {
    button.classList.remove('off');
    button.classList.add('on');
    button.innerHTML = 'On';
  } else {
    button.classList.remove('on');
    button.classList.add('off');
    button.innerHTML = 'Off';
  }

}
function hour(){
  let button = document.getElementById("hour")
  button.innerHTML = "Loading";
  button.classList.add("loading");
  let today = new Date();
  let yyyy = today.getFullYear();
  let mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
  let dd = String(today.getDate()).padStart(2, '0');
  let startDateFormat = yyyy + '-' + mm + '-' + dd;
  
  const hours = today.getHours();
  const minutes = today.getMinutes();
  const seconds = today.getSeconds();

  const oneHourAgo = new Date();
  oneHourAgo.setHours(hours - 1);
  oneHourAgo.setMinutes(minutes);
  oneHourAgo.setSeconds(seconds);

  //Get the data here then pass it to loadcharts
  fetch('/data-between/'+startDateFormat+'/'+startDateFormat)

    .then(response => response.json())
    .then(data=>{
      if(data.status != 200){
        alert("Hmm something went wrong...")
        console.log("Get status error - " + data.data + " | " + data.status);
      }else{
        let rawData = data.data;
        let saveData = rawData[0][0]
        let date = rawData[0][1]
        let newdata = []
        let selectedTimes = []

        for (let data of saveData) {
          const timeParts = data[9].split(":");
          const hour = Number(timeParts[0]);
          const minute = Number(timeParts[1]);
          const second = Number(timeParts[2]);
        
          const timeObj = new Date();
          timeObj.setHours(hour);
          timeObj.setMinutes(minute);
          timeObj.setSeconds(second);
        
          if (timeObj >= oneHourAgo && timeObj <= today) {
            selectedTimes.push(data);
          }
        }
        let store = [selectedTimes, date]
        newdata.push(store)
        resetBtn();
        loadCharts(newdata);
      };
    });
}
function today(){
  let button = document.getElementById("today")
  button.innerHTML = "Loading";
  button.classList.add("loading");
  let today = new Date();
  let yyyy = today.getFullYear();
  let mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
  let dd = String(today.getDate()).padStart(2, '0');
  let startDateFormat = yyyy + '-' + mm + '-' + dd;
  getData(startDateFormat, startDateFormat)
}
function yesturday(){
  let button = document.getElementById("yesturday")
  button.innerHTML = "Loading";
  button.classList.add("loading");
  var yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  var year = yesterday.getFullYear();
  var month = ("0" + (yesterday.getMonth() + 1)).slice(-2);
  var day = ("0" + yesterday.getDate()).slice(-2);

  var startDateFormat = year + "-" + month + "-" + day;
  getData(startDateFormat, startDateFormat)
}
function quickDate(day){
  var startDate = new Date();
  var endDate = new Date();

  let button = document.getElementById(day+"days")
  button.innerHTML = "Loading";
  button.classList.add("loading");

  startDate.setDate(startDate.getDate() - day);

  var year = startDate.getFullYear();
  var month = ("0" + (startDate.getMonth() + 1)).slice(-2);
  var day = ("0" + startDate.getDate()).slice(-2);

  let startDateFormat = year + "-" + month + "-" + day;

  endDate.setDate(endDate.getDate());

  var year = endDate.getFullYear();
  var month = ("0" + (endDate.getMonth() + 1)).slice(-2);
  var day = ("0" + endDate.getDate()).slice(-2);

  let endDateFormat = year + "-" + month + "-" + day;

  getData(startDateFormat, endDateFormat)
}
function getData(startDate,endDate){
  //Get the data here then pass it to loadcharts
  fetch('/data-between/'+startDate+'/'+endDate)

    .then(response => response.json())
    .then(data=>{
      if(data.status != 200){
        alert("Hmm something went wrong...\n\n" + "'" + data.data + "'")
        console.log("Get status error - " + data.data + " | " + data.status);
        resetBtn();
      }else{
        saveData = data.data;
        resetBtn();
        loadCharts(saveData);
      };
    });
}
function loadCharts(all_data){
  // all_data [[raw_data, date],[raw_data, date],[raw_data, date],[raw_data, date]]
  // raw_data = [pondLevel, nInnerLevel, nOuterLevel, waterTemp?, clarity?, cpuTemp, cpuFreq, usedDisk, time]
  pondLevel(all_data)
  innerLevel(all_data)
  outerLevel(all_data)
  tubLevel(all_data)
  waterTemp(all_data)
  waterState(all_data)
  cpuTemp(all_data)
  cpuFreq(all_data)
}

function pondLevel(all_data) { //Line chart | pond level

  var gData = new google.visualization.DataTable();
  gData.addColumn('datetime', 'Time');
  gData.addColumn('number', 'Level');

  // add data to the table
  var data = [];

  for (let i = 0; i < all_data.length; i++) {
    let raw_data = all_data[i][0];
    let date = all_data[i][1];

    // split the year, month, and day components
    let dateParts = date.split("-");
    let year = dateParts[0];
    let month = dateParts[1];
    let day = dateParts[2];

    for (let j = 0; j < raw_data.length; j++) {
      if (raw_data[j][9] !==null){
        let time;
        if (raw_data[j][9] == "True" |raw_data[j][9] == "False"){
         time = raw_data[j][13];
        }else{
          time = raw_data[j][9];
        }
        let level = parseFloat(raw_data[j][0]);

        let timeArr = time.split(":");
        let hour = parseInt(timeArr[0]);
        let minute = parseInt(timeArr[1]);
        let second = parseInt(timeArr[2]);

        let datetimeStr = year + '-' + month + '-' + day + 'T' + hour.toString().padStart(2, '0') + ':' + minute.toString().padStart(2, '0') + ':' + second.toString().padStart(2, '0');
        let datetime = new Date(datetimeStr);

        data.push([ datetime, level ]);
      }
    }
  }

  gData.addRows(data);

  var options = {
    title: 'Pond level',
    curveType: 'function',
    legend: { position: 'bottom' },
    vAxes: {
       0: {title: 'Level', minValue: 0, maxValue: 75}
    },
    series: {
        0: {targetAxisIndex: 0, color: "blue"}
    },
    hAxis: {
      format: 'yyyy-mm-ddTHH:mm:ss'
    }
  };

  var chart = new google.visualization.LineChart(document.getElementById('pondLevel'));
  chart.draw(gData, options);
}

function innerLevel(all_data) { //Line chart | inner enxus level

  var gData = new google.visualization.DataTable();
  gData.addColumn('datetime', 'Time');
  gData.addColumn('number', 'Level');

  // add data to the table
  var data = [];

  for (let i = 0; i < all_data.length; i++) {
    let raw_data = all_data[i][0];
    let date = all_data[i][1];

    // split the year, month, and day components
    let dateParts = date.split("-");
    let year = dateParts[0];
    let month = dateParts[1];
    let day = dateParts[2];

    for (let j = 0; j < raw_data.length; j++) {
      let time;
      if (raw_data[j][9] == "True" |raw_data[j][9] == "False"){
        time = raw_data[j][13];
      }else{
        time = raw_data[j][9];
      }
      let level = parseFloat(raw_data[j][1]);

      let timeArr = time.split(":");
      let hour = parseInt(timeArr[0]);
      let minute = parseInt(timeArr[1]);
      let second = parseInt(timeArr[2]);

      let datetimeStr = year + '-' + month + '-' + day + 'T' + hour.toString().padStart(2, '0') + ':' + minute.toString().padStart(2, '0') + ':' + second.toString().padStart(2, '0');
      let datetime = new Date(datetimeStr);

      data.push([ datetime, level ]);
    }
  }

  gData.addRows(data);

  var options = {
    title: 'Inside nexus level',
    curveType: 'function',
    legend: { position: 'bottom' },
    vAxes: {
       0: {title: 'Level', minValue: 0, maxValue: 72}
    },
    series: {
        0: {targetAxisIndex: 0, color: "blue"}
    },
    hAxis: {
      format: 'yyyy-mm-ddTHH:mm:ss'
    }
  };

  var chart = new google.visualization.LineChart(document.getElementById('innerLevel'));
  chart.draw(gData, options);
}

function outerLevel(all_data) { //Line chart | outerLevel Vs time

  var gData = new google.visualization.DataTable();
  gData.addColumn('datetime', 'Time');
  gData.addColumn('number', 'Level');

  // add data to the table
  var data = [];

  for (let i = 0; i < all_data.length; i++) {
    let raw_data = all_data[i][0];
    let date = all_data[i][1];

    // split the year, month, and day components
    let dateParts = date.split("-");
    let year = dateParts[0];
    let month = dateParts[1];
    let day = dateParts[2];

    for (let j = 0; j < raw_data.length; j++) {
      let time;
      if (raw_data[j][9] == "True" |raw_data[j][9] == "False"){
        time = raw_data[j][13];
      }else{
        time = raw_data[j][9];
      }
      let level = parseFloat(raw_data[j][2]);

      let timeArr = time.split(":");
      let hour = parseInt(timeArr[0]);
      let minute = parseInt(timeArr[1]);
      let second = parseInt(timeArr[2]);

      let datetimeStr = year + '-' + month + '-' + day + 'T' + hour.toString().padStart(2, '0') + ':' + minute.toString().padStart(2, '0') + ':' + second.toString().padStart(2, '0');
      let datetime = new Date(datetimeStr);

      data.push([ datetime, level ]);
    }
  }

  gData.addRows(data);

  var options = {
    title: 'Outer nexus level',
    curveType: 'function',
    legend: { position: 'bottom' },
    vAxes: {
       0: {title: 'Level', minValue: 0, maxValue: 52}
    },
    series: {
        0: {targetAxisIndex: 0, color: "blue"}
    },
    hAxis: {
      format: 'yyyy-mm-ddTHH:mm:ss'
    }
  };

  var chart = new google.visualization.LineChart(document.getElementById('outerLevel'));
  chart.draw(gData, options);
}

function tubLevel(all_data) { //Line chart | tubLevel Vs time

  var gData = new google.visualization.DataTable();
  gData.addColumn('datetime', 'Time');
  gData.addColumn('number', 'Level');

  // add data to the table
  var data = [];

  for (let i = 0; i < all_data.length; i++) {
    let raw_data = all_data[i][0];
    let date = all_data[i][1];

    // split the year, month, and day components
    let dateParts = date.split("-");
    let year = dateParts[0];
    let month = dateParts[1];
    let day = dateParts[2];

    for (let j = 0; j < raw_data.length; j++) {
      let time;
      if (raw_data[j][9] == "True" |raw_data[j][9] == "False"){
        time = raw_data[j][13];
      }else{
        time = raw_data[j][9];
      }
      let level = parseFloat(raw_data[j][3]);

      let timeArr = time.split(":");
      let hour = parseInt(timeArr[0]);
      let minute = parseInt(timeArr[1]);
      let second = parseInt(timeArr[2]);

      let datetimeStr = year + '-' + month + '-' + day + 'T' + hour.toString().padStart(2, '0') + ':' + minute.toString().padStart(2, '0') + ':' + second.toString().padStart(2, '0');
      let datetime = new Date(datetimeStr);

      data.push([ datetime, level ]);
    }
  }

  gData.addRows(data);

  var options = {
    title: 'Tub level',
    curveType: 'function',
    legend: { position: 'bottom' },
    vAxes: {
       0: {title: 'Level', minValue: 0, maxValue: 53}
    },
    series: {
        0: {targetAxisIndex: 0, color: "blue"}
    },
    hAxis: {
      format: 'yyyy-mm-ddTHH:mm:ss'
    }
  };

  var chart = new google.visualization.LineChart(document.getElementById('tubLevel'));
  chart.draw(gData, options);
}

function waterTemp(all_data) { //Line chart | temp Vs time

  var gData = new google.visualization.DataTable();
  gData.addColumn('datetime', 'Time');
  gData.addColumn('number', 'Temperature');

  // add data to the table
  var data = [];

  for (let i = 0; i < all_data.length; i++) {
    let raw_data = all_data[i][0];
    let date = all_data[i][1];

    // split the year, month, and day components
    let dateParts = date.split("-");
    let year = dateParts[0];
    let month = dateParts[1];
    let day = dateParts[2];

    for (let j = 0; j < raw_data.length; j++) {
      let time;
      if (raw_data[j][9] == "True" |raw_data[j][9] == "False"){
        time = raw_data[j][13];
      }else{
        time = raw_data[j][9];
      }
      let temp = parseFloat(raw_data[j][4]);

      let timeArr = time.split(":");
      let hour = parseInt(timeArr[0]);
      let minute = parseInt(timeArr[1]);
      let second = parseInt(timeArr[2]);

      let datetimeStr = year + '-' + month + '-' + day + 'T' + hour.toString().padStart(2, '0') + ':' + minute.toString().padStart(2, '0') + ':' + second.toString().padStart(2, '0');
      let datetime = new Date(datetimeStr);

      data.push([ datetime, temp ]);
    }
  }

  gData.addRows(data);

  var options = {
    title: 'Water Temperature',
    curveType: 'function',
    legend: { position: 'bottom' },
    vAxes: {
       0: {title: 'Temperature', minValue: 5, maxValue: 25},
    },
    series: {
        0: {targetAxisIndex: 0, color: "red"},
    },
    hAxis: {
      format: 'yyyy-mm-ddTHH:mm:ss'
    }
  };

  var chart = new google.visualization.LineChart(document.getElementById('waterTemp'));
  chart.draw(gData, options);
}

function waterState(all_data) { //Line chart | state Vs time

  var gData = new google.visualization.DataTable();
  gData.addColumn('datetime', 'Time');
  gData.addColumn('number', 'State');

  // add data to the table
  var data = [];

  for (let i = 0; i < all_data.length; i++) {
    let raw_data = all_data[i][0];
    let date = all_data[i][1];

    // split the year, month, and day components
    let dateParts = date.split("-");
    let year = dateParts[0];
    let month = dateParts[1];
    let day = dateParts[2];

    for (let j = 0; j < raw_data.length; j++) {
      let time;
      if (raw_data[j][9] == "True" |raw_data[j][9] == "False"){
        time = raw_data[j][13];
      }else{
        time = raw_data[j][9];
      }
      let state = parseFloat(raw_data[j][5]);

      let timeArr = time.split(":");
      let hour = parseInt(timeArr[0]);
      let minute = parseInt(timeArr[1]);
      let second = parseInt(timeArr[2]);

      let datetimeStr = year + '-' + month + '-' + day + 'T' + hour.toString().padStart(2, '0') + ':' + minute.toString().padStart(2, '0') + ':' + second.toString().padStart(2, '0');
      let datetime = new Date(datetimeStr);

      data.push([ datetime, state ]);
    }
  }

  gData.addRows(data);

  var options = {
    title: 'Water State',
    curveType: 'function',
    legend: { position: 'bottom' },
    vAxes: {
       0: {title: 'State', minValue: -1, maxValue: 1},
    },
    series: {
        0: {targetAxisIndex: 0, color: "green"},
    },
    hAxis: {
      format: 'yyyy-mm-ddTHH:mm:ss'
    }
  };

  var chart = new google.visualization.LineChart(document.getElementById('waterState'));
  chart.draw(gData, options);
}

function cpuTemp(all_data) { //Line chart | temp Vs time

  var gData = new google.visualization.DataTable();
  gData.addColumn('datetime', 'Time');
  gData.addColumn('number', 'Temperature');

  // add data to the table
  var data = [];

  for (let i = 0; i < all_data.length; i++) {
    let raw_data = all_data[i][0];
    let date = all_data[i][1];

    // split the year, month, and day components
    let dateParts = date.split("-");
    let year = dateParts[0];
    let month = dateParts[1];
    let day = dateParts[2];

    for (let j = 0; j < raw_data.length; j++) {
      let time;
      if (raw_data[j][9] == "True" |raw_data[j][9] == "False"){
        time = raw_data[j][13];
      }else{
        time = raw_data[j][9];
      }
      let temp = parseFloat(raw_data[j][6]);

      let timeArr = time.split(":");
      let hour = parseInt(timeArr[0]);
      let minute = parseInt(timeArr[1]);
      let second = parseInt(timeArr[2]);

      let datetimeStr = year + '-' + month + '-' + day + 'T' + hour.toString().padStart(2, '0') + ':' + minute.toString().padStart(2, '0') + ':' + second.toString().padStart(2, '0');
      let datetime = new Date(datetimeStr);

      data.push([ datetime, temp ]);
    }
  }

  gData.addRows(data);

  var options = {
    title: 'CPU Temperature',
    curveType: 'function',
    legend: { position: 'bottom' },
    vAxes: {
       0: {title: 'Temperature', minValue: 15, maxValue: 40},
    },
    series: {
        0: {targetAxisIndex: 0, color: "red"},
    },
    hAxis: {
      format: 'yyyy-mm-ddTHH:mm:ss'
    }
  };

  var chart = new google.visualization.LineChart(document.getElementById('cpuTemp'));
  chart.draw(gData, options);
}

function cpuFreq(all_data) { //Line chart | frequency Vs time

  var gData = new google.visualization.DataTable();
  gData.addColumn('datetime', 'Time');
  gData.addColumn('number', 'Frequency');

  // add data to the table
  var data = [];

  for (let i = 0; i < all_data.length; i++) {
    let raw_data = all_data[i][0];
    let date = all_data[i][1];

    // split the year, month, and day components
    let dateParts = date.split("-");
    let year = dateParts[0];
    let month = dateParts[1];
    let day = dateParts[2];

    for (let j = 0; j < raw_data.length; j++) {
      let time;
      if (raw_data[j][9] == "True" |raw_data[j][9] == "False"){
        time = raw_data[j][13];
      }else{
        time = raw_data[j][9];
      }
      let freq = parseFloat(raw_data[j][7]);

      let timeArr = time.split(":");
      let hour = parseInt(timeArr[0]);
      let minute = parseInt(timeArr[1]);
      let second = parseInt(timeArr[2]);

      let datetimeStr = year + '-' + month + '-' + day + 'T' + hour.toString().padStart(2, '0') + ':' + minute.toString().padStart(2, '0') + ':' + second.toString().padStart(2, '0');
      let datetime = new Date(datetimeStr);

      data.push([ datetime, freq ]);
    }
  }

  gData.addRows(data);

  var options = {
    title: 'CPU Frequency',
    curveType: 'function',
    legend: { position: 'bottom' },
    vAxes: {
       0: {title: 'Frequency', minValue: 600, maxValue: 1000},
    },
    series: {
        0: {targetAxisIndex: 0, color: "darkblue"},
    },
    hAxis: {
      format: 'yyyy-mm-ddTHH:mm:ss'
    }
  };

  var chart = new google.visualization.LineChart(document.getElementById('cpuFreq'));
  chart.draw(gData, options);
}

function resetBtn(){
  const buttons = ["hour","today", "yesturday", "7days", "15days", "30days"]
  const text = ["Hour","Today", "Yesturday", "7 Days", "15 Days", "30 Days"]
  for (x in buttons){
    let button = document.getElementById(buttons[x])
    button.innerHTML = text[x];
    button.classList.remove("loading");
  }
}

function downloadData(){

  let downloadData = [['indoorHumid','indoorTemp','outsideHumid','outsideTemp','boxHumid','boxTemp','cpuTemp','cpuFreq','storageUsed','time','date']]

  for (row in saveData){
    let date = saveData[row][1];
    console.log(date)
    let temp = [];
    let i =0;
    for (item in saveData[row][0][i]){
      temp.push(item);
    }
    i++;
    temp.push(date);
    downloadData.push(temp)
  }
  // create a Blob object from the array
  const blob = new Blob([JSON.stringify(downloadData)], {type: "application/json"});

  // create a URL object from the Blob
  const url = URL.createObjectURL(blob);

  // create a link to download the file
  const a = document.createElement("a");
  a.href = url;
  a.download = "data.csv";
  document.body.appendChild(a);
  a.click();

  // clean up
  URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

setInterval(update, 6000);