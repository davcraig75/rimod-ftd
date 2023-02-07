setTimeout(function () {
  var columns=["Age","Sex","Disease","Gene","Mutation","Pathology","Disease-Gene","Min pmd","pH"];
  var data=JSON.parse(JSON.stringify(samples.json));

  crossex("example_graph",data,
      [
        {"editable":itgapp.vega_vals},
        {"exportable":true},        
        {"name":"X_Axis","value":"Gene","bind":{"options":columns}},
        {"name":"Y_Axis","value":"None","bind":{"options":columns}},
        {"name":"Facet_Cols_By","value":"Pathology","bind":{"options":columns}},   
        {"name":"Facet_Rows_By","value":"None","bind":{"options":columns}},       
        {"name":"Color_By","value":"Mutation","bind":{"options":columns}},     
        {"name":"graph_title","value":"Sample Counts By "},
        {"name":"Dash_Height","value":0.75},
        {"name":"Legend_Height","value":70},
        {"name":"Palette","value":"category10"},
        {"name":"X_Axis_Height","value":100},
        {"name":"Row_Height","value":100},
        {"name":"Row_Header_Width","value":100},
        {"name":"Legend_Cols","value":4},
        {"name":"Max_Plot_Height","value":150},
        {"name":"Dash_Width","value":0.3}
      ],"itg-browser-width"
    );  
}, 10);
