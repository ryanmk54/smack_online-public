// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.

//= require bootstrap-select
//= require moment
//= require Chart
//= require plotly

// Default span for '# projects per span' graphs
DEFAULT_SPAN = 20;

var chart;
var chartConfiguration = {};
var currentChartDataArray = [];

$().ready(function() {

    // Set initial graph and menu value to DEFAULT_SPAN
    $("#numberPicker").val(DEFAULT_SPAN);

    getProjectsFromServer(displayUsageChart, '/analytics/usage');

    // Set action for the number drop-down
    $("#numberPicker").change(function()
    {
        resetProjectList();
        resetCanvas();
        var currentlyActiveListItem = document.getElementsByClassName("list-group-item active")[0].id;
        if(currentlyActiveListItem == 'usageListItem')
            getProjectsFromServer(displayUsageChart, '/analytics/usage');
        else if(currentlyActiveListItem == 'userCreationListItem')
            getProjectsFromServer(displayUsageChart, '/analytics/users_created')
    });

    // Set action for the unit drop-down
    $("#unitPicker").change(function()
    {
        resetProjectList();
        resetCanvas();
        getProjectsFromServer(displayUsageChart, '/analytics/usage');
        var currentlyActiveListItem = document.getElementsByClassName("list-group-item active")[0].id;
        if(currentlyActiveListItem == 'usageListItem')
            getProjectsFromServer(displayUsageChart, '/analytics/usage');
        else if(currentlyActiveListItem == 'userCreationListItem')
            getProjectsFromServer(displayUsageChart, 'analytics/users_created');
    });

    // Set action for the unit drop-down
    $("#usageListItem").click(function()
    {
        $('.selectpicker').selectpicker('show');
        $(this).siblings().removeClass('active');
        $(this).addClass('active');
        resetProjectList();
        resetCanvas();
        getProjectsFromServer(displayUsageChart, '/analytics/usage');
    });

    // Set action for the unit drop-down
    $("#runtimeListItem").click(function()
    {
        $('.selectpicker').selectpicker('hide');
        $(this).siblings().removeClass('active');
        $(this).addClass('active');
        resetProjectList();
        resetCanvas();
        getProjectsFromServer(displayRuntimeGraph, '/analytics/project_runtimes');
    });

    // Set action for the unit drop-down
    $("#geographicListItem").click(function()
    {
        $('.selectpicker').selectpicker('hide');
        $(this).siblings().removeClass('active');
        $(this).addClass('active');
        resetProjectList();
        resetCanvas();
        getAndUnpackGeoCSV(displayGeochart);
    });

    // Set action for the unit drop-down
    $("#userCreationListItem").click(function()
    {
        $('.selectpicker').selectpicker('show');
        $(this).siblings().removeClass('active');
        $(this).addClass('active');
        resetProjectList();
        resetCanvas();
        getProjectsFromServer(displayUsageChart, '/analytics/users_created')
    });
});

function getProjectsFromServer(callback, url)
{
    $.ajax({
        type: "GET",
        data: {
            format: 'json'
        },
        dataType: "json",
        url: 'http://0.0.0.0:3000/' + url,

        success: function(data){
            callback(data)
        }
    });
}

function getAndUnpackGeoCSV(callback)
{
    // Get the csv at /analytics/project_location_csv
    Plotly.d3.csv('/analytics/project_location_csv', function(err, rows) {
        var locationNames = unpack(rows, 'name'),
            locationCounts = unpack(rows, 'pop'),
            latitudes = unpack(rows, 'lat'),
            longitudes = unpack(rows, 'lon')

        // Pass the CSV data to the callback
        callback(latitudes, longitudes, locationCounts, locationNames);
    });
}

function displayGeochart(latitudes, longitudes, locationCounts, locationNames)
{
    //TODO: Scale locationSizes by setting a scale and dividing each size by it
    var locationSizes = [];
    var hoverTextArray = [];
    for (var i = 0; i < locationCounts.length; i++) {
        locationSizes.push(locationCounts[i]);
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
        title: '# of SMACK Projects Made Per United States City',
        showlegend: false,
        geo: {
            scope: 'usa',
            showland: true,
            landcolor: 'rgb(217, 217, 217)'
        },
    };

    Plotly.newPlot(document.getElementById('graphContainer'), data, layout);
}

/*
 * Takes data input and displays it according to the given
 * span and unit.
 */
function displayUsageChart(dataArray){

    var unit = $('#unitPicker').val();
    var span = $('#numberPicker').val();

    currentChartDataArray = dataArray;
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
    setChartConfigurationForUsage(labelArray, valueArray, colorArray, unit);
    chart = new Chart(ctx, chartConfiguration);
}

function onUsageGraphBarClick(evt)
{
    resetProjectList();
    var element = chart.getElementAtEvent(evt)
    var label = chartConfiguration.data.labels[element[0]._index];
    $("#projectListHeader").html("Projects made on/in " + label);
    for(var i = 0; i < currentChartDataArray.length; i++) {
        var projId = currentChartDataArray[i].id;
        // For day units
        if (currentChartDataArray[i].created_at == label)
            $("#projectList").append("<li><a href = '/projects/" + projId + "/edit'>" + projId + "</a></li>");
        else {
            // Check for month units
            var labelMonth = label.substring(0, 2);
            var dataMonth = currentChartDataArray[i].created_at.toString().substring(0, 2);
            var labelYear = label.substring(3);
            var dataYear = currentChartDataArray[i].created_at.toString().substring(6);
            if(labelMonth == dataMonth && labelYear == dataYear)
                $("#projectList").append("<li><a href = '/projects/" + projId + "/edit'>" + projId + "</a></li>");
        }
    }
}

function onRuntimeGraphBarClick(evt)
{
    resetProjectList();
    var element = chart.getElementAtEvent(evt)
    var label = chartConfiguration.data.labels[element[0]._index];
    $("#projectListHeader").html("Projects with a Runtime of " + label + " Seconds");
    for(var i = 0; i < currentChartDataArray.length; i++) {
        var projId = currentChartDataArray[i].id;
        if (currentChartDataArray[i].runtime == label)
            $("#projectList").append("<li><a href = '/projects/" + projId + "/edit'>" + projId + "</a></li>");
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

function resetProjectList()
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
    currentChartDataArray = dataArray;
    var KVArray = []; // 'Key-Value Array'
    var labelArray = [];

    // Count the number of data occurrences for each label
    // and populate the key-value array accordingly
    for (var i = 0; i < dataArray.length; i++) {
        var key = dataArray[i].runtime
        if ((key in KVArray))
            KVArray[key] += 1;
        else
            KVArray[key] = 1;
    }

    var max = Math.max.apply(null, Object.keys(KVArray));
    for (var i = 0; i <= max; i++)
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

