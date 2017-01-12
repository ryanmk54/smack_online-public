// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.

//= require moment
//= require Chart

$().ready(function() {

    // The default span is 10 days
    pollDataAndDisplayGraph(10, "day");

    // Set action for the number drop-down
    $("#numberPicker").change(function updateGraph()
    {
        resetCanvas();
        pollDataAndDisplayGraph(this.value, $("#unitPicker").val());
    });

    // Set action for the unit drop-down
    $("#unitPicker").change(function updateGraph()
    {
        resetCanvas();
        pollDataAndDisplayGraph($("#numberPicker").val(), this.value);
    });
});

/*
 * Polls the web server for all 'projects' and displays
 * the resulting graph.
 */
function pollDataAndDisplayGraph(span, unit) {
    // Polls the web server for all 'project' objects
    // (JSON) and passes them to 'renderTimeGraph()'
    $.ajax({
        type: "GET",
        data: {
            format: 'json'
        },
        dataType: "json",
        url: "/analytics/usage",

        success: function(data){
            renderTimeGraph(data, span, unit)
        }
    });
}

/*
 * Takes data input and displays it according to the given
 * span and unit.
 */
function renderTimeGraph(dataArray, span, unit){
    var KVArray = []; // 'Key-Value Array'
    var labelArray = [];

    var formattedLabel;
    // Create the list of labels for the last x days.
    for (var i = span - 1; i >= 0; i--) {
        if(unit == "day") {
            var date = moment().subtract(i, 'days').date();
            var month = moment().subtract(i, 'days').month() + 1;
            if (date < 10)
                date = "0" + date;
            if (month < 10)
                month = "0" + month;

            // Format: 03/17
            formattedLabel = month + "/" + date;
        }
        else if(unit == "month")
        {
            var month = moment().subtract(i, 'months').month() + 1;
            var year = moment().subtract(i, 'months').year().toString().substring(2);
            if (month < 10)
                month = "0" + month;
            if (year < 10)
                year = "0" + year;
            formattedLabel = month + "/" + year;
        }
        labelArray.push(formattedLabel)
        KVArray[formattedLabel] = 0;
    }

    // Count the number of data occurrences for each label
    // and populate the key-value array accordingly
    for (var i = 0; i < dataArray.length; i++) {
        var key;
        if(unit == "day")
            key = dataArray[i].created_at.substring(0, 5);
        else if(unit == "month") {
            key = dataArray[i].created_at.substring(0, 2);
            key += "/" + dataArray[i].created_at.substring(6);
        }
        if ((key in KVArray))
            KVArray[key] += 1;
    }

    // This is necessary to 'sort' the KVArray
    var valueArray = [];
    var colorArray = [];
    for (var i = 0; i < labelArray.length; i++) {
        valueArray.push(KVArray[labelArray[i]]);
        colorArray[i] = "rgb(" + Math.floor((Math.random() * 255)) + "," + Math.floor((Math.random() * 255))
            + "," + Math.floor((Math.random() * 255)) + ")";
    }

    var canvas = document.getElementById("myChart");
    var ctx = canvas.getContext("2d");
    var parent = document.getElementById('graphContainer');
    canvas.width = parent.offsetWidth;
    canvas.height = parent.offsetHeight;
    new Chart(ctx, {
        type: 'bar',
        options: {
            responsive: true,
            maintainAspectRatio: false
        },
        data: {
            labels: labelArray,
            datasets: [{
                label: '# of projects created per day',
                data: valueArray,
                borderWidth: 1,
                backgroundColor: colorArray
            }]
        }
    });
}

function resetCanvas()
{
    $('#myChart').remove(); // this is my <canvas> element
    $('#graphContainer').append('<canvas id="myChart"><canvas>');
}
