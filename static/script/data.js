let saveData = [];
let auto = false;

function update(){
  if (auto) {
    hour()
  }
}

function reduceData(data){
  let newData = []
  let reduction = parseInt(document.getElementById('reduction').value);
  data.forEach(date => {
    let i = 0
    let nextRow = 0
    let newRowData = []
    date[0].forEach(row => {
      if (i == nextRow){
        newRowData.push(row);
        nextRow = i + reduction
      }
      i++;
    });
    newData.push([newRowData, date[1]])
  });
  return newData;
};

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
        let dataRows = rawData[0][0]
        let date = rawData[0][1]
        let newdata = []
        let selectedTimes = []

        for (let data of dataRows) {
          let timeParts;
          if (data[9] == "True" |data[9] == "False"){
            timeParts = data[13].split(":");
          }else{
            timeParts = data[9].split(":");
          }
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
        saveData = newData;
        resetBtn();
        let hourData = reduceData(newData)
        loadCharts(hourData);
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
        let showData = reduceData(saveData);
        loadCharts(showData);
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

  // Create a trace (a series in the plot)
  var trace = {
    x: data.map(point => point[0]),
    y: data.map(point => point[1]),
    type: 'scatter',
    mode: 'lines+markers',
    name: 'Level'
  };

  // Create the layout for the plot
  var layout = {
    title: 'Pond level',
    xaxis: { title: 'Datetime' },
    yaxis: { title: 'Level' }
  };

  // Combine the trace and layout to create the plot
  var plotData = [trace];
  Plotly.newPlot('pondLevel', plotData, layout);
}

function innerLevel(all_data) { //Line chart | inner enxus level
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
    // Create a trace (a series in the plot)
    var trace = {
      x: data.map(point => point[0]),
      y: data.map(point => point[1]),
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Level'
    };
  
    // Create the layout for the plot
    var layout = {
      title: 'Inside nexus level',
      xaxis: { title: 'Datetime' },
      yaxis: { title: 'Level' }
    };
  
    // Combine the trace and layout to create the plot
    var plotData = [trace];
    Plotly.newPlot('innerLevel', plotData, layout);
}

function outerLevel(all_data) { //Line chart | outerLevel Vs time
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
    // Create a trace (a series in the plot)
    var trace = {
      x: data.map(point => point[0]),
      y: data.map(point => point[1]),
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Level'
    };
  
    // Create the layout for the plot
    var layout = {
      title: 'Outer nexus level',
      xaxis: { title: 'Datetime' },
      yaxis: { title: 'Level' }
    };
  
    // Combine the trace and layout to create the plot
    var plotData = [trace];
    Plotly.newPlot('outerLevel', plotData, layout);
}

function tubLevel(all_data) { //Line chart | tubLevel Vs time
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
    // Create a trace (a series in the plot)
    var trace = {
      x: data.map(point => point[0]),
      y: data.map(point => point[1]),
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Level'
    };
  
    // Create the layout for the plot
    var layout = {
      title: 'Tub level',
      xaxis: { title: 'Datetime' },
      yaxis: { title: 'Level' }
    };
  
    // Combine the trace and layout to create the plot
    var plotData = [trace];
    Plotly.newPlot('tubLevel', plotData, layout);
}

function waterTemp(all_data) { //Line chart | temp Vs time
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
    // Create a trace (a series in the plot)
    var trace = {
      x: data.map(point => point[0]),
      y: data.map(point => point[1]),
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Temperature',
      line: {
        color: 'red'  // Set the line color
      },
      marker: {
        color: 'red'  // Set the marker color
      }
    };
  
    // Create the layout for the plot
    var layout = {
      title: 'Water temperature',
      xaxis: { title: 'Datetime' },
      yaxis: { title: 'Level' }
    };
  
    // Combine the trace and layout to create the plot
    var plotData = [trace];
    Plotly.newPlot('waterTemp', plotData, layout);
}

function waterState(all_data) { //Line chart | state Vs time
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
  // Create a trace (a series in the plot)
  var trace = {
    x: data.map(point => point[0]),
    y: data.map(point => point[1]),
    type: 'scatter',
    mode: 'lines+markers',
    name: 'State',
    line: {
      color: 'green'  // Set the line color
    },
    marker: {
      color: 'green'  // Set the marker color
    }
  };

  // Create the layout for the plot
  var layout = {
    title: 'Water state',
    xaxis: { title: 'Datetime' },
    yaxis: { title: 'Level' }
  };

  // Combine the trace and layout to create the plot
  var plotData = [trace];
  Plotly.newPlot('waterState', plotData, layout);
}

function cpuTemp(all_data) { //Line chart | temp Vs time
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
  // Create a trace (a series in the plot)
  var trace = {
    x: data.map(point => point[0]),
    y: data.map(point => point[1]),
    type: 'scatter',
    mode: 'lines+markers',
    name: 'Temperature',
    line: {
      color: 'red'  // Set the line color
    },
    marker: {
      color: 'red'  // Set the marker color
    }
  };

  // Create the layout for the plot
  var layout = {
    title: 'CPU temperature',
    xaxis: { title: 'Datetime' },
    yaxis: { title: 'temperature' }
  };

  // Combine the trace and layout to create the plot
  var plotData = [trace];
  Plotly.newPlot('cpuTemp', plotData, layout);
}

function cpuFreq(all_data) { //Line chart | frequency Vs time
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
  // Create a trace (a series in the plot)
  var trace = {
    x: data.map(point => point[0]),
    y: data.map(point => point[1]),
    type: 'scatter',
    mode: 'lines+markers',
    name: 'CPU frequency',
    line: {
      color: 'darkblue'  // Set the line color
    },
    marker: {
      color: 'darkblue'  // Set the marker color
    }
  };

  // Create the layout for the plot
  var layout = {
    title: 'CPU frequency',
    xaxis: { title: 'Datetime' },
    yaxis: { title: 'frequency' }
  };

  // Combine the trace and layout to create the plot
  var plotData = [trace];
  Plotly.newPlot('cpuFreq', plotData, layout);
}

function resetBtn(){
  const buttons = ["hour","today", "yesturday", "7days"]
  const text = ["Hour","Today", "Yesturday", "7 Days"]
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