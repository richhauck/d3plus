d3plus.apps.network = {}
d3plus.apps.network.data = "object";
d3plus.apps.network.requirements = ["nodes","edges"];
d3plus.apps.network.tooltip = "static"
d3plus.apps.network.shapes = ["circle","square","donut"];
d3plus.apps.network.scale = 1.05
d3plus.apps.network.nesting = false
d3plus.apps.network.zoom = true

d3plus.apps.network.draw = function(vars) {

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Use filtered lists if they are available
  //-------------------------------------------------------------------
  var nodes = vars.nodes.restricted || vars.nodes.value,
      edges = vars.edges.restricted || vars.edges.value

  var x_range = d3.extent(nodes,function(n){return n.x}),
      y_range = d3.extent(nodes,function(n){return n.y})

  var val_range = d3.extent(d3.values(vars.data.app), function(d){
    var val = d3plus.variable.value(vars,d,vars.size.key)
    return val == 0 ? null : val
  });

  if (typeof val_range[0] == "undefined") val_range = [1,1]

  var distances = []
  nodes.forEach(function(n1){
    nodes.forEach(function(n2){
      if (n1 != n2) {
        var xx = Math.abs(n1.x-n2.x);
        var yy = Math.abs(n1.y-n2.y);
        distances.push(Math.sqrt((xx*xx)+(yy*yy)))
      }
    })
  })

  var max_size = d3.min(distances,function(d){
    return d;
  })

  if (vars.edges.arrows.value) {
      max_size = max_size*0.45
  }
  else {
    max_size = max_size*0.6
  }
  var width = (x_range[1]+max_size*1.1)-(x_range[0]-max_size*1.1),
      height = (y_range[1]+max_size*1.1)-(y_range[0]-max_size*1.1)
      aspect = width/height,
      app = vars.app_width/vars.app_height

  if (app > aspect) {
    var scale = vars.app_height/height
  }
  else {
    var scale = vars.app_width/width
  }
  var min_size = max_size*0.25
  if (min_size*scale < 3) {
    min_size = 3/scale
  }

  // Create size scale
  var radius = d3.scale[vars.size.scale.value]()
    .domain(val_range)
    .range([min_size, max_size])

  vars.zoom.bounds = [[x_range[0]-max_size*1.1,y_range[0]-max_size*1.1],[x_range[1]+max_size*1.1,y_range[1]+max_size*1.1]]

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Match nodes to data
  //-------------------------------------------------------------------
  var data = [], lookup = {}
  nodes.forEach(function(n){
    if (vars.data.app[n[vars.id.key]]) {
      var obj = d3plus.utils.merge(n,vars.data.app[n[vars.id.key]])
    }
    else {
      var obj = d3plus.utils.copy(n)
    }
    obj.d3plus = {}
    obj.d3plus.x = n.x
    obj.d3plus.y = n.y
    lookup[obj[vars.id.key]] = {
      "x": obj.d3plus.x,
      "y": obj.d3plus.y
    }
    var val = d3plus.variable.value(vars,obj,vars.size.key)
    obj.d3plus.r = val ? radius(val) : radius.range()[0]
    data.push(obj)
  })

  data.sort(function(a,b){
    return b.d3plus.r - a.d3plus.r
  })

  edges.forEach(function(l,i){
    if (typeof l.source != "object") {
      var obj = {}
      obj[vars.id.key] = l.source
      l.source = obj
    }
    l.source.d3plus = {}
    var id = l.source[vars.id.key]
    l.source.d3plus.x = lookup[id].x
    l.source.d3plus.y = lookup[id].y
    if (typeof l.target != "object") {
      var obj = {}
      obj[vars.id.key] = l.target
      l.target = obj
    }
    l.target.d3plus = {}
    var id = l.target[vars.id.key]
    l.target.d3plus.x = lookup[id].x
    l.target.d3plus.y = lookup[id].y
  })

  vars.mouse[d3plus.evt.click] = function(d) {
    d3plus.tooltip.remove(vars.type.value)
    if (d[vars.id.key] == vars.focus.value) {
      vars.zoom.viewport = vars.zoom.bounds
      vars.viz.focus(null).draw()
    }
    else {
      var x_bounds = [lookup[d[vars.id.key]].x],
          y_bounds = [lookup[d[vars.id.key]].y]

      vars.connections(d[vars.id.key],true).forEach(function(c){
        x_bounds.push(lookup[c[vars.id.key]].x)
        y_bounds.push(lookup[c[vars.id.key]].y)
      })

      var xcoords = d3.extent(x_bounds),
          ycoords = d3.extent(y_bounds)

      vars.zoom.viewport = [[xcoords[0]-max_size,ycoords[0]-max_size],[xcoords[1]+max_size,ycoords[1]+max_size]]
      vars.viz.focus(d[vars.id.key]).draw()
    }
  }

  return {"nodes": data, "edges": edges}

}
