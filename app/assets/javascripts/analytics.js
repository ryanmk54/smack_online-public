// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.

//= require bootstrap-select
//= require moment
//= require Chart
//= require plotly

// Default span for '# projects per span' graphs
DEFAULT_SPAN = 20;

GEOGRAPH_BUBBLE_SCALE = 10;
MAX_GEOGRAPH_BUBBLE_SIZE = 100;
MIN_GEOGRPAH_BUBBLE_SIZE = 5;

var chart;
var chartConfiguration = {};
var currentProjectChartDataArray = [];
var currentUserChartDataArray = [];
var geoCSV;

$().ready(function() {

    // Set initial graph and menu value to DEFAULT_SPAN
    $("#numberPicker").val(DEFAULT_SPAN);

    getProjectsFromServerIfNotCached(displayUsageChart);

    // Set action for the number drop-down
    $("#numberPicker").change(function()
    {
        resetSidebarList();
        resetCanvas();
        var currentlyActiveListItem = document.getElementsByClassName("list-group-item active")[0].id;
        if(currentlyActiveListItem == 'usageListItem')
            getProjectsFromServerIfNotCached(displayUsageChart);
        else if(currentlyActiveListItem == 'userCreationListItem')
            getUsersFromServerIfNotCached(displayUsageChart)
    });

    // Set action for the unit drop-down
    $("#unitPicker").change(function()
    {
        resetSidebarList();
        resetCanvas();
        var currentlyActiveListItem = document.getElementsByClassName("list-group-item active")[0].id;
        if(currentlyActiveListItem == 'usageListItem')
            getProjectsFromServerIfNotCached(displayUsageChart);
        else if(currentlyActiveListItem == 'userCreationListItem')
            getUsersFromServerIfNotCached(displayUsageChart);
    });

    // Set action for the unit drop-down
    $("#usageListItem").click(function()
    {
        if(!$(this).hasClass('active')) {
            $('.selectpicker').selectpicker('show');
            $(this).siblings().removeClass('active');
            $(this).addClass('active');
            resetSidebarList();
            resetCanvas();
            getProjectsFromServerIfNotCached(displayUsageChart);
        }
    });

    // Set action for the unit drop-down
    $("#runtimeListItem").click(function()
    {
        if(!$(this).hasClass('active')) {
            $('.selectpicker').selectpicker('hide');
            $(this).siblings().removeClass('active');
            $(this).addClass('active');
            resetSidebarList();
            resetCanvas();
            getProjectsFromServerIfNotCached(displayRuntimeGraph);
        }
    });

    // Set action for the unit drop-down
    $("#geographicListItem").click(function()
    {
        if(!$(this).hasClass('active')) {
            $('.selectpicker').selectpicker('hide');
            $(this).siblings().removeClass('active');
            $(this).addClass('active');
            resetSidebarList();
            resetCanvas();
            if(geoCSV == null)
                getGeoCSV();
            else
                unpackGeoCSVAndDisplayChart(displayGeochart);
        }
    });

    // Set action for the unit drop-down
    $("#userCreationListItem").click(function()
    {
        if(!$(this).hasClass('active')) {
            $('.selectpicker').selectpicker('show');
            $(this).siblings().removeClass('active');
            $(this).addClass('active');
            resetSidebarList();
            resetCanvas();
            getUsersFromServerIfNotCached(displayUsageChart)
        }
    });
});

function getProjectsFromServerIfNotCached(callback, url)
{
    if(currentProjectChartDataArray.length != 0)
        callback(currentProjectChartDataArray);
    else
        $.ajax({
            type: "GET",
            data: {
                format: 'json'
            },
            dataType: "json",
            url: '/analytics/usage',

            success: function(data){
                currentProjectChartDataArray = data;
                callback(data)
            }
        });
}

function getUsersFromServerIfNotCached(callback, url)
{
    if(currentUserChartDataArray.length != 0)
        callback(currentUserChartDataArray);
    else
        $.ajax({
            type: "GET",
            data: {
                format: 'json'
            },
            dataType: "json",
            url: '/analytics/users_created',

            success: function(data){
                currentUserChartDataArray = data;
                callback(data)
            }
        });
}

function getGeoCSV()
{
    Plotly.d3.csv('/analytics/project_location_csv', function(err, rows) {
        geoCSV = rows;
        unpackGeoCSVAndDisplayChart();
    });
}

function unpackGeoCSVAndDisplayChart()
{
    var locationNames = unpack(geoCSV, 'name'),
        locationCounts = unpack(geoCSV, 'pop'),
        latitudes = unpack(geoCSV, 'lat'),
        longitudes = unpack(geoCSV, 'lon')

    // Pass the CSV data to the callback
    displayGeochart(latitudes, longitudes, locationCounts, locationNames);
}

function displayGeochart(latitudes, longitudes, locationCounts, locationNames)
{
    //TODO: Scale locationSizes by setting a scale and dividing each size by it
    var locationSizes = [];
    var hoverTextArray = [];
    var stateSizes = [];
    for (var i = 0; i < locationCounts.length; i++) {
      if(locationCounts[i] / GEOGRAPH_BUBBLE_SCALE < MIN_GEOGRPAH_BUBBLE_SIZE)
        locationSizes.push(MIN_GEOGRPAH_BUBBLE_SIZE)
      else if(locationCounts[i] / GEOGRAPH_BUBBLE_SCALE > MAX_GEOGRAPH_BUBBLE_SIZE)
        locationSizes.push(MAX_GEOGRAPH_BUBBLE_SIZE)
      else
        locationSizes.push(locationCounts[i] / GEOGRAPH_BUBBLE_SCALE);
      hoverTextArray.push(locationNames[i] + " # Projects: " + locationCounts[i]);
    }

    var data = [{
        type: 'scattergeo',
        locationmode: 'USA-states',
        lat: latitudes,
        lon: longitudes,
        hoverinfo: 'text',
        text: hoverTextArray,
        marker: { size: locationSizes }
    }];

    var layout = {
        title: 'Number of SMACK Projects Made Per State/Province',
        showlegend: false,
        geo: {
            showland: true,
            landcolor: 'rgb(217, 217, 217)'
        },
    };
    var myPlot = document.getElementById('graphContainer');
    Plotly.plot(myPlot, data, layout);
}

/*
 * Takes data input and displays it according to the given
 * span and unit.
 */
function displayUsageChart(dataArray){

    var unit = $('#unitPicker').val();
    var span = $('#numberPicker').val();

    var KVArray = []; // 'Key-Value Array'
    var labelArray = [];

    // Create the list of labels for the last <span> units.
    for (var i = span - 1; i >= 0; i--) {
        var formattedLabel;
        if(unit == "day")
            formattedLabel = generateMonthDayYearLabel(i);
        else if(unit == "month")
            formattedLabel = generateMonthYearLabel(i);
        labelArray.push(formattedLabel)
        KVArray[formattedLabel] = 0;
    }

    // Count the number of data occurrences for each label
    // and populate the key-value array accordingly
    for (var i = 0; i < dataArray.length; i++) {
        var key;
        if(unit == "day")
            key = dataArray[i].created_at;
        else if(unit == "month")
            key = dataArray[i].created_at.substring(0, 2) + "/" + dataArray[i].created_at.substring(6);
        if ((key in KVArray))
            KVArray[key] += 1;
    }

    // This is necessary to 'sort' the KVArray
    // Create random color array while we're at it
    var valueArray = [];
    var colorArray = [];
    for (var i = 0; i < labelArray.length; i++) {
        valueArray.push(KVArray[labelArray[i]]);
        colorArray[i] = "rgb(" + randRGBVal() + "," + randRGBVal() + "," + randRGBVal() + ")";
    }

    var canvas = document.getElementById("myChart");
    var ctx = canvas.getContext("2d");
    if(1 < labelArray.length) {
      setChartConfigurationForUsage(labelArray, valueArray, colorArray, unit);
      chart = new Chart(ctx, chartConfiguration);
    } else {
      alert('hi')
    }
}

function onUsageGraphBarClick(evt)
{
    // Either the user creation graph or project creation graph was clicked
    var type = $('#userCreationListItem').hasClass('active') ? 'user' : 'project';
    var dataArray = type == 'user' ? currentUserChartDataArray : currentProjectChartDataArray

    resetSidebarList();

    // Get the label associated with the clicked bar.
    var element = chart.getElementAtEvent(evt)
    var label = chartConfiguration.data.labels[element[0]._index];

    // Generate the list header
    var onOrIn = $('#unitPicker').val() == 'month' ? 'in' : 'on';
    //TODO: change the names of these html element ids
    type == 'user' ? $("#projectListHeader").html("Users made " + onOrIn + " " + label)
        : $("#projectListHeader").html("Projects made " + onOrIn + " " + label);

    // Day and month labels have different formats
    if($('#unitPicker').val() == 'day')
        // Loop through the data and list items whose 'created_at' matches the label
        for(var i = 0; i < dataArray.length; i++) {
            var id = dataArray[i].id;
            if (dataArray[i].created_at == label) {
                if (type == 'project') {
                    var title = dataArray[i].title;
                    var listLabel = title == null || title == "" ? id : dataArray[i].title;
                    $("#projectList").append("<li><a href = '/projects/" + id + "/edit'>" + listLabel + "</a></li>");
                }
                else {
                    var email = dataArray[i].email
                    var listLabel = email == "" || email == null ? id : dataArray[i].email;
                    $("#projectList").append("<li><a href = '/users/" + id + "'>" + listLabel + "</a></li>");
                }
            }
        }
    else
        // Loop through the data and list items whose 'created_at' formatted
        // as 'month/year' match the label
        for(var i = 0; i < dataArray.length; i++) {
            var labelMonth = label.substring(0, 2);
            var dataMonth = dataArray[i].created_at.toString().substring(0, 2);
            var labelYear = label.substring(3);
            var dataYear = dataArray[i].created_at.toString().substring(6);
            var id = dataArray[i].id;
	    if (labelMonth == dataMonth && labelYear == dataYear) {
                if (type == 'project') {
                    var title = dataArray[i].title;
                    var listLabel = title == null || title == "" ? id : dataArray[i].title;
                    $("#projectList").append("<li><a href = '/projects/" + id + "/edit'>" + listLabel + "</a></li>");
                }
                else {
                    var email = dataArray[i].email
                    var listLabel = email == "" || email == null ? id : dataArray[i].email;
                    $("#projectList").append("<li><a href = '/users/" + id + "'>" + listLabel + "</a></li>");
                }
            }
        }
}

function onRuntimeGraphBarClick(evt)
{
    resetSidebarList();

    // Get the label associated with the clicked bar.
    var element = chart.getElementAtEvent(evt)
    var label = chartConfiguration.data.labels[element[0]._index];

    // Set the list header
    $("#projectListHeader").html("Projects with a Runtime of " + label + " Seconds");

    // Loop through the data and list all
    for(var i = 0; i < currentProjectChartDataArray.length; i++) {
        var id = currentProjectChartDataArray[i].id;
        if (currentProjectChartDataArray[i].runtime == label) {
            var title = currentProjectChartDataArray[i].title;
            var listLabel = title == null || title == "" ? id : title;
            $("#projectList").append("<li><a href = '/projects/" + id + "/edit'>" + listLabel + "</a></li>");
        }
    }
}


/*
 * Generate a month/day/year string, e.g 03/17/94
 * for the day i days before today
 */
function generateMonthDayYearLabel(daysPrevious) {
    var date = moment().subtract(daysPrevious, 'days').date();
    var month = moment().subtract(daysPrevious, 'days').month() + 1;
    var year = moment().subtract(daysPrevious, 'days').year().toString().substring(2);
    if (date < 10)
        date = "0" + date;
    if (month < 10)
        month = "0" + month;
    return month + "/" + date + "/" + year;
}

/*
 * Generate a month/year string, e.g 03/94
 * for the month i months before today
 */
function generateMonthYearLabel(monthsPrevious) {
    var month = moment().subtract(monthsPrevious, 'months').month() + 1;
    var year = moment().subtract(monthsPrevious, 'months').year().toString().substring(2);
    if (month < 10)
        month = "0" + month;
    if (year < 10)
        year = "0" + year;
    return month + "/" + year;
}


function setChartConfigurationForUsage(labelArray, valueArray, colorArray, unit)
{
    chartConfiguration = {
        type: 'bar',
        options: {
            responsive: true,
            maintainAspectRatio: false,
            onClick: onUsageGraphBarClick,
            scales: {
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Dates'
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: '# of Projects'
                    }
                }]
            }
        },
        data: {
            labels: labelArray,
            datasets: [{
                label: '# of projects created per ' + unit,
                data: valueArray,
                borderWidth: 1,
                backgroundColor: colorArray
            }]
        }
    }
}

function setChartConfigurationForRuntime(labelArray, valueArray, colorArray)
{
    chartConfiguration = {
        type: 'bar',
        options: {
            responsive: true,
            maintainAspectRatio: false,
            onClick: onRuntimeGraphBarClick,
            scales: {
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Runtime (Seconds)'
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: '# of Projects'
                    }
                }]
            }
        },
        data: {
            labels: labelArray,
            datasets: [{
                label: 'hello',
                data: valueArray,
                borderWidth: 1,
                backgroundColor: colorArray
            }]
        }
    }
}

/*
 * Deletes everything from the parent div and recreates the graphContainer div and myChart canvas
 */
function resetCanvas()
{
    $('#parent').html("");
    $('#parent').append('<div id="graphContainer" class="height100"><div>')
    $('#graphContainer').append('<canvas id="myChart"><canvas>');
}

function resetSidebarList()
{
    $("#projectList").html("");
    $('#projectListHeader').html("");
}

/*
 * Returns an integer between 0 and 255
 */
function randRGBVal()
{
    return Math.floor((Math.random() * 255));
}

function unpack(rows, key) {
    return rows.map(function(row) { return row[key]; });
}

function displayRuntimeGraph(dataArray)
{
    var KVArray = []; // 'Key-Value Array'
    var labelArray = [];

    // Count the number of data occurrences for each label
    // and populate the key-value array accordingly
    for (var i = 0; i < dataArray.length; i++) {
        var key = dataArray[i].runtime
        if ((key in KVArray))
            KVArray[key] += 1;
        else if(key != null)
            KVArray[key] = 1;
    }

    var max = Math.max.apply(null, Object.keys(KVArray));
    for (var i = 0; i <= max; i++)
      if(KVArray[i] != null)
        labelArray.push(i);

    // This is necessary to 'sort' the KVArray
    // Create random color array while we're at it
    var valueArray = [];
    var colorArray = [];
    for (var i = 0; i < labelArray.length; i++) {
        var value = KVArray[labelArray[i]];
        if(value != undefined)
            valueArray.push(KVArray[labelArray[i]]);
        else valueArray.push(0)
        colorArray[i] = "rgb(" + randRGBVal() + "," + randRGBVal() + "," + randRGBVal() + ")";
    }

    var canvas = document.getElementById("myChart");
    var ctx = canvas.getContext("2d");
    setChartConfigurationForRuntime(labelArray, valueArray, colorArray);
    chart = new Chart(ctx, chartConfiguration);
}

