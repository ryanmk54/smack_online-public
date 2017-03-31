// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.

//= require bootstrap-select
//= require bootstrap-datepicker
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
    
    // Set action 'Update Graph' Button
    $("#dateGo").click(function()
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
    $("#usageListItem").click(function()
    {
        if(!$(this).hasClass('active')) {
            $("#graphTitle").html("Number of Projects Created per Unit (Day or Month)");
            $("#rangecontainer").show();
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
            $("#graphTitle").html("Number of Projects with a Given Runtime (seconds)");
            $("#rangecontainer").hide();
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
            $("#graphTitle").html("");
            $("#rangecontainer").hide();
            $(this).siblings().removeClass('active');
            $(this).addClass('active');
            resetSidebarList();
            resetCanvas();
            if(geoCSV == null)
                getGeoCSV();
            else
                displayGeochart();
        }
    });
    
    // Set action for the unit drop-down
    $("#userCreationListItem").click(function()
    {
        if(!$(this).hasClass('active')) {
            $("#graphTitle").html("Number of Users Created per Unit (Day or Month)");
            $("#rangecontainer").show();
            $(this).siblings().removeClass('active');
            $(this).addClass('active');
            resetSidebarList();
            resetCanvas();
            getUsersFromServerIfNotCached(displayUsageChart)
        }
    });
    
    // Set start date to one month ago
    var monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    $("#beginningDate").datepicker('update', formatDateMMDDYYYY(monthAgo));
    $("#beginningDate").datepicker({autoclose: true});
    
    // Set end date to today
    var today = new Date();
    $("#endDate").datepicker('update', formatDateMMDDYYYY(today));
    
    // Make sure the beginning date does not overlap the end date when changed
    $('#beginningDate').datepicker().on('changeDate', function(e){
        $('#beginningDate').datepicker('hide');
        var begDateVal = $('#beginningDate').val();
        var endDateVal = $('#endDate').val()
        $('#endDate').datepicker('setStartDate', begDateVal);
        begTime = (new Date(begDateVal)).getTime();
        endTime = (new Date(endDateVal)).getTime();
        if(begTime > endTime)
            $('#endDate').datepicker('update', begDateVal);
    });
    
    // Make sure the end date does not overlap the start date when changed
    $('#endDate').datepicker().on('changeDate', function(e){
        $('#endDate').datepicker('hide');
        var begDateVal = $('#beginningDate').val();
        var endDateVal = $('#endDate').val()
        $('#beginningDate').datepicker('setEndDate', endDateVal);
        begTime = (new Date(begDateVal)).getTime();
        endTime = (new Date(endDateVal)).getTime();
        if(begTime > endTime)
            $('#beginningDate').datepicker('update', endDateVal);
    });
});

function getProjectsFromServerIfNotCached(callback)
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

function getUsersFromServerIfNotCached(callback)
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
        displayGeochart();
    });
}

function displayGeochart()
{
    var locationNames = unpack(geoCSV, 'name'),
        locationCounts = unpack(geoCSV, 'pop'),
        latitudes = unpack(geoCSV, 'lat'),
        longitudes = unpack(geoCSV, 'lon')
    
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
    
    var KVArray = []; // 'Key-Value Array'
    var labelArray = [];
    
    var unit;
    
    if($('input[name=aggregate]:checked').val() == "day") {
        var begDate = $("#beginningDate").val();
        var endDate = $("#endDate").val();
        
        unit = "day";
        
        // Create the list of labels formatted DD/MM/YY
        var currentDateObject = new Date(begDate);
        var currentDateFormatted = formatDateMMDDYY(currentDateObject);
        var endDateFormatted = formatDateMMDDYY(new Date(endDate));
        while(currentDateFormatted != endDateFormatted) {
            currentDateFormatted = formatDateMMDDYY(currentDateObject);
            labelArray.push(currentDateFormatted);
            KVArray[currentDateFormatted] = 0;
            currentDateObject.setDate(currentDateObject.getDate() + 1);
        }
        
        // This is if the start and end date are the same
        if(labelArray.length == 0)
        {
            labelArray.push(currentDateFormatted);
            KVArray[currentDateFormatted] = 0;
        }
        
        // Count the number of data occurrences for each label
        // and populate the key-value array accordingly
        var key;
        for (var i = 0; i < dataArray.length; i++) {
            key = dataArray[i].created_at;
            if ((key in KVArray))
                KVArray[key] += 1;
        }
    }
    else if($('input[name=aggregate]:checked').val() == "month") {
        var begDate = $("#beginningDate").val();
        var endDate = $("#endDate").val();
        unit = "month";
    
        // Create the list of labels formatted DD/MM/YY
        var currentDateObject = new Date(begDate);
        var currentDateFormatted = formatDateMMYY(currentDateObject);
        var endDateFormatted = formatDateMMYY(new Date(endDate));
        while(currentDateFormatted != endDateFormatted) {
            currentDateFormatted = formatDateMMYY(currentDateObject);
            labelArray.push(currentDateFormatted);
            KVArray[currentDateFormatted] = 0;
            currentDateObject.setMonth(currentDateObject.getMonth() + 1);
        }
    
        // This is if the start and end date are the same
        if(labelArray.length == 0)
        {
            labelArray.push(currentDateFormatted);
            KVArray[currentDateFormatted] = 0;
        }
        
        // Count the number of data occurrences for each label
        // and populate the key-value array accordingly
        for (var i = 0; i < dataArray.length; i++) {
            var key = dataArray[i].created_at.substring(0, 2) + "/" + dataArray[i].created_at.substring(6);
            if ((key in KVArray))
                KVArray[key] += 1;
        }
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
    // Either the user creation graph or project creation graph was clicked
    var type = $('#userCreationListItem').hasClass('active') ? 'user' : 'project';
    var dataArray = type == 'user' ? currentUserChartDataArray : currentProjectChartDataArray
    
    resetSidebarList();
    
    // Get the label associated with the clicked bar.
    var element = chart.getElementAtEvent(evt)
    var label = chartConfiguration.data.labels[element[0]._index];
    
    // Generate the list header
    var onOrIn = $('#aggregate').val() == 'month' ? 'in' : 'on';
    //TODO: change the names of these html element ids
    type == 'user' ? $("#projectListHeader").html("Users made " + onOrIn + " " + label)
        : $("#projectListHeader").html("Public projects made " + onOrIn + " " + label);
    
    // Day and month labels have different formats
    if($("input[name='aggregate']:checked").val() == "day")
    // Loop through the data and list items whose 'created_at' matches the label
        for(var i = 0; i < dataArray.length; i++) {
            var id = dataArray[i].id;
            if (dataArray[i].created_at == label) {
                if (type == 'project') {
                    if(dataArray[i].public == true) {
                        var title = dataArray[i].title;
                        var listLabel = title == null || title == "" ? id : dataArray[i].title;
                        $("#projectList").append("<li><a href = '/projects/" + id + "/edit'>" + listLabel + "</a></li>");
                    }
                }
                else {
                    var username = dataArray[i].username
                    var listLabel = username == "" || username == null ? id : dataArray[i].username;
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
                    if(dataArray[i].public == true) {
                        var title = dataArray[i].title;
                        var listLabel = title == null || title == "" ? id : dataArray[i].title;
                        $("#projectList").append("<li><a href = '/projects/" + id + "/edit'>" + listLabel + "</a></li>");
                    }
                }
                else {
                    var username = dataArray[i].username
                    var listLabel = username == "" || username == null ? id : dataArray[i].username;
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
    $("#projectListHeader").html("Public projects with a Runtime of " + label + " Seconds");
    
    // Loop through the data and list all
    for(var i = 0; i < currentProjectChartDataArray.length; i++) {
        var id = currentProjectChartDataArray[i].id;
        var public = currentProjectChartDataArray[i].public;
        if (currentProjectChartDataArray[i].runtime == label && public == true) {
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
    var type;
    document.getElementsByClassName("list-group-item active")[0].id == 'userCreationListItem'
        ? type = 'Users' : type = 'Projects';
    
    var chartTitle = 'Number of ' + type + ' Created from ' + $("#beginningDate").val() + " to " + $("#endDate").val();
    
    chartConfiguration = {
        type: 'bar',
        options: {
            responsive: true,
            maintainAspectRatio: false,
            onClick: onUsageGraphBarClick,
            legend: {
                display: false
            },
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
                    },
                    ticks: {
                        min: 0
                    }
                }]
            }
        },
        data: {
            labels: labelArray,
            datasets: [{
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
            legend: {
                display: false
            },
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
                    },
                    ticks: {
                        min: 0
                    }
                }]
            }
        },
        data: {
            labels: labelArray,
            datasets: [{
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

function unpack(rows, key) {
    return rows.map(function(row) { return row[key]; });
}

/*
 * Returns an integer between 0 and 255
 */
function randRGBVal()
{
    return Math.floor((Math.random() * 255));
}

function formatDateMMDDYYYY(date)
{
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    if(day < 10)
        day = '0' + day;
    if(month < 10)
        month = '0' + month;
    return month + '/' + day + '/' + year;
}

function formatDateMMDDYY(date)
{
    var year = date.getFullYear().toString().substr(2);
    var month = date.getMonth() + 1;
    var day = date.getDate();
    if(day < 10)
        day = '0' + day;
    if(month < 10)
        month = '0' + month;
    return month + '/' + day + '/' + year;
}

function formatDateMMYY(date)
{
    var year = date.getFullYear().toString().substr(2);
    var month = date.getMonth() + 1;
    if(month < 10)
        month = '0' + month;
    return month + '/' + year;
}

