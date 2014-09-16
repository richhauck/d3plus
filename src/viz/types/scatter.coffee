fetchValue = require "../../core/fetch/value.js"
print      = require "../../core/console/print.coffee"
sort       = require "../../array/sort.coffee"

graph = require "./helpers/graph/draw.coffee"
ticks = require "./helpers/graph/dataTicks.coffee"

# Scatterplot
scatter = (vars) ->

  # Calculate X and Y domains, using "size" as a buffer
  graph vars,
    buffer: vars.size.value
    mouse:  true

  # Assign x, y, and radius to each data point
  for d in vars.data.viz
    d.d3plus.x  = vars.x.scale.viz fetchValue(vars, d, vars.x.value)
    d.d3plus.x += vars.axes.margin.left

    d.d3plus.y  = vars.y.scale.viz fetchValue(vars, d, vars.y.value)
    d.d3plus.y += vars.axes.margin.top

    if typeof vars.size.value is "number" or !vars.size.value
      d.d3plus.r = vars.axes.scale 0
    else
      d.d3plus.r = vars.axes.scale fetchValue(vars, d, vars.size.value)

  # Create data ticks
  ticks vars

  # Return the data, sorted
  sort vars.data.viz, vars.order.value or vars.size.value or vars.id.value,
       if vars.order.sort.value is "desc" then "asc" else "desc",
       vars.color.value or [], vars

# Visualization Settings and Helper Functions
scatter.fill = true
scatter.requirements = ["data", "x", "y"]
scatter.scale = 1.1
scatter.setup = (vars) ->
  vars.self.x scale: "continuous" if vars.x.value is vars.time.value
  vars.self.y scale: "continuous" if vars.y.value is vars.time.value
scatter.shapes = ["circle", "square", "donut"]
scatter.tooltip = "static"

module.exports = scatter
