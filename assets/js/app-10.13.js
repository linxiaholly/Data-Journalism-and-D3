// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;
/// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
.select("#scatter")
.append("svg")
.attr("width", svgWidth)
.attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
.attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";
// function used for updating x-scale var upon click on axis label
function xScale(JData, chosenXAxis) {
// create scales
var xLinearScale = d3.scaleLinear()
  .domain([d3.min(JData, d => d[chosenXAxis]) * 0.8,
    d3.max(JData, d => d[chosenXAxis]) * 1.2
  ])
  .range([0, width]);

return xLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
var bottomAxis = d3.axisBottom(newXScale);

xAxis.transition()
  .duration(1000)
  .call(bottomAxis);

return xAxis;
}

// function used for updating Y-scale var upon click on axis label
function YScale(JData, chosenYAxis) {
  // create scales
  var YLinearScale = d3.scaleLinear()
  .domain([0, d3.max(JData, d => d[chosenYAxis])])
  .range([height, 0]);
  
  return YLinearScale;
  
  }
  
  // function used for updating YAxis var upon click on axis label
  function renderYAxes(newYScale, YAxis) {
  var leftAxis = d3.axisLeft(newYScale);
  
  YAxis.transition()
    .duration(1000)
    .call(leftAxis);
  
  return YAxis;
  }

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis,chosenYAxis,newYScale) {

circlesGroup.transition()
  .duration(1000)
  .attr("cx", d => newXScale(d[chosenXAxis]))
  .attr("cy", d => newYScale(d[chosenYAxis]));

return circlesGroup;
}
// new text labels
function renderText(TextGroup, newXScale, chosenXAxis, chosenYAxis,newYScale) {

  TextGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]))
    .attr("y", d => newYScale(d[chosenYAxis]));
  
  return TextGroup;
  }
  
// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis,chosenYAxis, circlesGroup) {

if (chosenXAxis === "poverty" && chosenYAxis === "healthcare") {
  var label = "Poverty";
  var y = "HealthCare";
}
else if (chosenXAxis === "age" && chosenYAxis === "smokes"){
  var label = "Age";
  var y  = "Smokes";
}
else if (chosenXAxis === "age" && chosenYAxis === "healthcare"){
    var label = "Age";
    var y  = "HealthCare";
  }
else if (chosenXAxis === "poverty" && chosenYAxis === "smokes"){
    var label = "Poverty";
    var y  = "Smokes";
  }

var toolTip = d3.tip()
  .attr("class", "d3-tip")
  .offset([80, -60])
  .html(function(d) {
    return (`${d.state}<br>${label} ${d[chosenXAxis]}<br>${y} ${d[chosenYAxis]}`);
  });

circlesGroup.call(toolTip);

circlesGroup.on("mouseover", function(data) {
  toolTip.show(data,this);
})
  // onmouseout event
  .on("mouseout", function(data, index) {
    toolTip.hide(data);
  });

return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("data.csv")
  .then(function(JData) {

// parse data
JData.forEach(function(data) {
  data.poverty = +data.poverty;
  data.healthcare = +data.healthcare;
  data.age = +data.age;
  data.smokes = +data.smokes

});

// xLinearScale function above csv import
var xLinearScale = xScale(JData, chosenXAxis);

// Create y scale function
var YLinearScale = YScale(JData,chosenYAxis);

// Create initial axis functions
var bottomAxis = d3.axisBottom(xLinearScale);
var leftAxis = d3.axisLeft(YLinearScale);

// append x axis
var xAxis = chartGroup.append("g")
  .attr("transform", `translate(0, ${height})`)
  .call(bottomAxis);

// append y axis
chartGroup.append("g")
  .call(leftAxis);

// append initial circles
var circlesGroup = chartGroup.selectAll("circle")
  .data(JData)
  .enter()
  .append("circle")
  .attr("class","stateCircle")
  .attr("cx", d => xLinearScale(d[chosenXAxis]))
  .attr("cy", d => YLinearScale(d[chosenYAxis]))
  .attr("r", 15)
  .attr("opacity", ".5")
  

//append state on circle
var TextGroup = chartGroup.selectAll("tspan")
  .data(JData)
  .enter()
  .append("text")
  .attr("class","stateText")
  .append("tspan")
  .text(function(d) { return d.abbr; })
  .attr("x",d => xLinearScale(d[chosenXAxis]))
  .attr("y", d => YLinearScale(d[chosenYAxis]-0.2));

// Create group for  2 x- axis labels
var labelsGroup = chartGroup.append("g")
  .attr("transform", `translate(${width / 2}, ${height + 20})`);

var povertyLabel = labelsGroup.append("text")
  .attr("x", 0)
  .attr("y", 20)
  .attr("value", "poverty") // value to grab for event listener
  .classed("active", true)
  .text("In Poverty %");

var ageLabel = labelsGroup.append("text")
  .attr("x", 0)
  .attr("y", 40)
  .attr("value", "age") // value to grab for event listener
  .classed("inactive", true)
  .text("Age (Median)");

// append y axis
var labelYgroup = chartGroup.append("g")
 .attr("transform", "rotate(-90)");
var healthcareLabel = labelYgroup.append("text")
  .attr("y", 0 - margin.left+20)
  .attr("x", 0 - (height / 2))
  .attr("dy", "1em")
  .classed("active", true)
  .text("Healthcare %");

var smokeLabel = labelYgroup.append("text")
  .attr("y", 0 - margin.left)
  .attr("x", 0 - (height / 2))
  .attr("dy", "1em")
  .classed("active", true)
  .text("Smokes %");

// updateToolTip function above csv import
var circlesGroup = updateToolTip(chosenXAxis,chosenYAxis, circlesGroup);
// x axis labels event listener
labelsGroup.selectAll("text")
  .on("click", function() {
    // get value of selection
    var value = d3.select(this).attr("value");
    if (value !== chosenXAxis) {

      // replaces chosenXAxis with value
      chosenXAxis = value;

      // console.log(chosenXAxis)

      // functions here found above csv import
      // updates x scale for new data
      xLinearScale = xScale(JData, chosenXAxis);

      // updates x axis with transition
      xAxis = renderXAxes(xLinearScale, xAxis);

      // updates circles with new x values
      circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis,YLinearScale,chosenYAxis);
      TextGroup = renderText(TextGroup, xLinearScale, chosenXAxis,YLinearScale,chosenYAxis);
      // updates tooltips with new info
      circlesGroup = updateToolTip(chosenXAxis, circlesGroup,chosenYAxis);

      // changes classes to change bold text
      if (chosenXAxis === "age") {
        ageLabel
          .classed("active", true)
          .classed("inactive", false);
        povertyLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else {
        ageLabel
          .classed("active", false)
          .classed("inactive", true);
        povertyLabel
          .classed("active", true)
          .classed("inactive", false);
      }
    }
  });
  // Y axis labels event listener
  labelYgroup.selectAll("text")
  .on("click", function() {
    // get value of selection
    var value = d3.select(this).attr("value");
    if (value !== chosenYAxis) {

      // replaces chosenXAxis with value
      chosenYAxis = value;

      // console.log(chosenXAxis)

      // functions here found above csv import
      // updates x scale for new data
      YLinearScale = YScale(JData, chosenYAxis);

      // updates x axis with transition
      YAxis = renderYAxes(YLinearScale, YAxis);

      // updates circles with new x values
      circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis,YLinearScale,chosenYAxis);
      TextGroup = renderText(TextGroup, xLinearScale, chosenXAxis,YLinearScale,chosenYAxis);
      // updates tooltips with new info
      circlesGroup = updateToolTip(chosenXAxis, circlesGroup,chosenYAxis);

      // changes classes to change bold text
      if (chosenYAxis === "smokes") {
        smokeLabel
          .classed("active", true)
          .classed("inactive", false);
        healthcareLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else {
        smokeLabel
          .classed("active", false)
          .classed("inactive", true);
        healthcareLabel
          .classed("active", true)
          .classed("inactive", false);
      }
    }
  });
});
