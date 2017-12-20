// GenMap begins on line 114
// GenTable begins on line 283
// GenPanelTwo begins on line 757
// GenScatter begins on line 980
//
// Spinner loading controls
var opts = {
  lines: 9, // The number of lines to draw
  length: 16, // The length of each line
  width: 6.5, // The line thickness
  radius: 14, // The radius of the inner circle
  color: '#EE3124', // #rgb or #rrggbb or array of colors
  speed: 1.9, // Rounds per second
  trail: 40, // Afterglow percentage
  className: 'spinner' // The CSS class to assign to the spinner
}

var target_panel1 = document.getElementById("container");
var target_panel2 = document.getElementById("container2");
//var target_panel3 = document.getElementById("container3");

var spinner_panel1 = new Spinner(opts).spin(target_panel1);
var spinner_panel2 = new Spinner(opts).spin(target_panel2);
//var spinner_panel3 = new Spinner(opts).spin(target_panel3);

d3.json('/data-lab-data/2017_CoC_Grantee_Areas_2.json', function(us) {
  d3.json('/data-lab-data/us-states.json', function(json) {
    d3.csv('/data-lab-data/coc-pop.csv', function(d) {
      return {
        coc_number: d.coc_number,
        pop: +d.pop
      }
    }, function(data) {
      d3.csv('/data-lab-data/State_crosswalk.csv', function(states) {
        d3.csv('/data-lab-data/CFDACOCAward.csv', function(bar_chrt) {
          d3.csv('/data-lab-data/pop-award.csv', function(d) {
            return {
              total_homeless: +d.total_homeless,
              value: +d.value
            }
          }, function(scatter_data) {
            d3.json('/data-lab-data/coc-pop-type.json', function(table_data) {
              d3.csv('/data-lab-data/coc_by_value.csv', function(map_data) {

                //console.log("bar_chrt: ", bar_chrt)

                // Initialize visualization
                GenMap()
                GenPanelTwo()
                //**GenScatter()**//

                // Radio button control Panel 1
                $(document).ready(function() {
                  $("input[type='radio']").on('change', function() {
                    var selectedValue = $("input[name='radio']:checked").val();

                    if (selectedValue === 'Map') {
                      d3.selectAll('#viz_container').remove()
                      d3.selectAll('svg').remove()
                      d3.select('svg_1').remove()
                      d3.select('svg_2').remove()
                      GenMap()
                      GenPanelTwo()
                      //GenScatter();

                    } else if (selectedValue === 'Table') {
                      d3.selectAll('#viz_container').remove()
                      d3.selectAll('#legend').remove()
                      d3.selectAll('svg').remove()
                      d3.select('svg_1').remove()
                      d3.select('svg_2').remove()
                      GenTable()
                      GenPanelTwo()
                      //GenScatter()
                    }
                  })
                })

                // **************************************************************

                function getColor(d) {
                  for (var i = 0; i < data.length; i++) {
                    if (d.properties.coc_number === data[i].coc_number) {
                      if (data[i].pop <= 100) {
                        return ("#E8E6E6");
                      } else if (data[i].pop <= 200) {
                        return ("#D8D4D5");
                      } else if (data[i].pop <= 300) {
                        return ("#C0B9BB");
                      } else if (data[i].pop <= 500) {
                        return ("#C4CBBC");
                      } else if (data[i].pop <= 700) {
                        return ("#A3A99C");
                      } else if (data[i].pop <= 1000) {
                        return ("#8D8F8B");
                      } else if (data[i].pop <= 1500) {
                        return ("#A3A99C");
                      } else if (data[i].pop <= 2000) {
                        return ("#8D8F8B");
                      } else if (data[i].pop <= 2500) {
                        return ("#989496");
                      } else if (data[i].pop <= 3000) {
                        return ("#A28E94");
                      } else if (data[i].pop <= 3500) {
                        return ("#887A7E");
                      } else if (data[i].pop <= 4000) {
                        return ("#8A6F78");
                      } else if (data[i].pop <= 5000) {
                        return ("#A96585");
                      } else if (data[i].pop <= 6000) {
                        return ("#A365A9");
                      } else if (data[i].pop <= 7000) {
                        return ("#744A78");
                      } else if (data[i].pop <= 8000) {
                        return ("#7F6B81");
                      } else if (data[i].pop <= 12000) {
                        return ("#614463");
                      } else {
                        return ("#291C2A")
                      }
                    }
                  }
                }

                function getValue(d) {
                  for (var i = 0; i < data.length; i++) {
                    if (d.properties.coc_number === data[i].coc_number) {
                      return formatNumber2(data[i].pop);
                    }
                  }
                }

                function getState(d) {
                  for (var i = 0; i < states.length; i++) {
                    if (d.properties.stusab === states[i].Abbrv) {
                      return states[i].State;
                    }
                  }
                }

                function GenMap() {
                  spinner_panel1.stop();

                  d3.select("#container").append('div').attr("id", "legend");
                  d3.select("#container").append('div').attr("id", "viz_container");

                  var width = 1000,
                    height = 600,
                    centered = null;

                  var formatNumber = d3.format("$,");
                  var OtherformatNumber = d3.format(",");

                  // D3 Projection
                  var projection = d3.geo.albersUsa()
                    .translate([width / 2, height / 2]) // translate to center of screen
                    .scale([1200]); // scale things down so see entire US ---1455

                  // Define path generator
                  var path = d3.geo.path() // path generator that will convert GeoJSON to SVG paths
                    .projection(projection); // tell path generator to use albersUsa projection

                  var div = d3.select("#viz_container")
                    .append("div")
                    .attr("id", "map_container")
                    .attr("width", width)
                    .attr("height", height);

                  // Append Div for tooltip to SVG
                  var tip = d3.select("#map_container")
                    .append("div")
                    .attr("class", "tooltip")
                    .style("opacity", 0);

                  var svg = d3.select("#map_container")
                    .append("svg")
                    .attr("id", "svg")
                    .attr("width", '950px')
                    .attr("height", '575px');

                  var legendWidth = "950px";

                  var legend = d3.select("#legend")
                    .append("div")
                    .attr("width", "950px")
                    .attr("height", "100px")
                    .attr("padding", "50px 0 0 50px");

                  var color = ["#E8E6E6", "#D8D4D5", "#C0B9BB", "#C4CBBC", "#A3A99C",
                    "#8D8F8B", "#A3A99C", "#8D8F8B", "#989496", "#A28E94", "#887A7E",
                    "#8A6F78", "#A96585", "#A365A9", "#744A78", "#7F6B81", "#614463", "#291C2A"
                  ]

                  var legend_key_values = ["< 100", "100-200", "200-300", "300-500", "500-700", "700-1k", "1k-1.5k",
                    "1.5k-2k", "2k-2.5k", "2.5k-3k", "3k-3.5k", "3.5k-4k", "4k-5k",
                    "5k-6k", "6k-7k", "7k-8k", "8k-12k", "> 12k"
                  ];

                  for (var i = 0; i < 18; i++) {

                    var g = legend.append("div")
                      .attr("id", "legend_key");

                    var key = g.append("div")
                      .attr("id", "key")
                      .style("position", "relative")
                      .append("svg")
                      .attr("height", "40px")
                      .attr("width", "53px")
                      .append("rect")
                      .attr("x", 10)
                      .attr("y", 10)
                      .attr("height", 30)
                      .attr("width", 30)
                      .style("fill", function(d) {
                        return color[i];
                      });


                    g.append("div")
                      .attr("id", "key_value")
                      .style("position", "relative")
                      .style("color", "blue")
                      .html("<p>" + legend_key_values[i] + "</p>");
                  }

                  //Append title
                  /*legend.append("text")
                  	.attr("class", "legendTitle")
                  	.attr("x", 512)
                  	.attr("y", 60)
                  	.style("text-anchor", "middle")
                  	.text("Continuum of Care Homeless Population");

                  var min = d3.min(data, function(d) {
                  	return d.pop;
                  });
                  var max = d3.max(data, function(d) {
                  	return d.pop;
                  });*/



                  var g = svg.append("g")
                    .attr("class", "counties")
                    .selectAll("path")
                    .data(us.features)
                    .enter().append("path")
                    .attr("class", "coc")
                    .attr("data-coc", function(d) {
                      return d.properties.coc_number;
                    })
                    .attr("data-state", function(d) {
                      return d.properties.state;
                    })
                    .attr("data-name", function(d) {
                      return d.properties.name;
                    })
                    .attr("d", path)
                    /*.on("mouseover", function(d) {
                    		tip.transition()
                    				 .duration(200)
                    				 .style("opacity", 1);
                    				 div.html(d.properties.COCNAME + "<br>" + "Continuum of Care Number: " + d.properties.coc_number)
                    				 .style("left", (d3.event.pageX) + "px")
                    				 .style("top", (d3.event.pageY) + "px");
                    })
                    	// fade out tooltip on mouse out
                    	.on("mouseout", function(d) {
                    			tip.transition()
                    				 .duration(500)
                    				 .style("opacity", 0);
                    	})*/
                    .on("click", clicked)
                    .style("fill", getColor);

                  function clicked(d) {
                    var x, y, k;

                    //console.log("Panel 1 clicked, d: ",d);

                    for (var i = 0; i < states.length; i++) {
                      if (d.properties.STUSAB == states[i].Abbrv) {
                        for (var h = 0; h < json.features.length; h++) {
                          if (states[i].State == json.features[h].properties.NAME) {
                            var n = json.features[h]
                            //console.log("clicked n: ",n);
                            if (n && centered !== n) {
                              var centroid = path.centroid(n)
                              x = centroid[0]
                              y = centroid[1]

                              //console.log("d: ",d.properties.NAME);
                              if (n.properties.NAME === "Florida") {
                                k = 5.0
                              } else if (n.properties.NAME === "Michigan") {
                                k = 5.5
                              } else if (n.properties.NAME === "Idaho") {
                                k = 3.25
                              } else if (n.properties.NAME === "Alaska") {
                                k = 5.0
                              } else if (n.properties.NAME === "Hawaii") {
                                k = 7.0
                              } else if (n.properties.CENSUSAREA <= 15000) {
                                k = 11.0
                              } else if (n.properties.CENSUSAREA > 15000 && n.properties.CENSUSAREA <= 30000) {
                                k = 9.0
                              } else if (n.properties.CENSUSAREA > 30000 && n.properties.CENSUSAREA <= 50000) {
                                k = 8.0
                              } else if (n.properties.CENSUSAREA > 50000 && n.properties.CENSUSAREA <= 70000) {
                                k = 6.5
                              } else if (n.properties.CENSUSAREA > 70000 && n.properties.CENSUSAREA <= 90000) {
                                k = 6.0
                              } else if (n.properties.CENSUSAREA > 90000 && n.properties.CENSUSAREA <= 110000) {
                                k = 5.0
                              } else if (n.properties.CENSUSAREA > 110000 && n.properties.CENSUSAREA <= 130000) {
                                k = 4.0
                              } else if (n.properties.CENSUSAREA > 130000 && n.properties.CENSUSAREA <= 150000) {
                                k = 3.5
                              } else {
                                k = 2.75
                              };
                              centered = n;

                            } else {
                              x = width / 2;
                              y = height / 2;
                              k = 1;
                              centered = null;

                            }

                            g.selectAll("path")
                              .classed("active", centered && function(d) {
                                return d === centered;
                              });

                            g.transition()
                              .duration(750)
                              .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
                              .style("stroke-width", .25 / k + "px");
                          }
                        }
                      }
                    }
                  }
                } //end of GenMap()

                function GenTable() {

                  //console.log("table data: ", table_data)

                  table_data.forEach(function(d) {
                    d.total_homeless = +d.total_homeless
                    d.chronically_homeless = +d.chronically_homeless
                    d.sheltered_homeless = +d.sheltered_homeless
                    d.unsheltered_homeless = +d.unsheltered_homeless
                    d.homeless_individuals = +d.homeless_individuals
                    d.homeless_veterans = +d.homeless_veterans
                    d.homeless_people_in_families = +d.homeless_people_in_families
                    d.homeless_unaccompanied_youth = +d.homeless_unaccompanied_youth
                  });

                  var column_names = ["CoC Number", "CoC Name", "Total Homeless", "Sheltered Homeless", "Unsheltered Homeless", "Chronically Homeless", "Homeless Veterans", "Homeless Individuals", "Homeless People in Families", "Homeless Unaccompanied Youth (Under 25)"];

                  var clicks = {
                    coc_number: 0,
                    coc_name: 0,
                    total_homeless: 0,
                    chronically_homeless: 0,
                    sheltered_homeless: 0,
                    unsheltered_homeless: 0,
                    homeless_veterans: 0,
                    homeless_individuals: 0,
                    homeless_people_in_families: 0,
                    homeless_unaccompanied_youth: 0
                  };

                  d3.select("#container")
                    .attr("height", "700px")
                    .attr("width", "1024px");

                  d3.select("#container").append('div')
                    .attr("id", "viz_container")
                    .attr("height", "700px")
                    .attr("width", "1000px");

                  d3.select("#viz_container").append("h3")
                    .attr("id", "title")
                    .style("text-align", "center")
                    .text("Continuum of Care 2016 Homeless Population")

                  d3.select("#viz_container").append("div")
                    .attr("class", "SearchBar")
                    .append("p")
                    .attr("class", "SearchBar")
                    .text("Search By CoC Name:");

                  d3.select(".SearchBar")
                    .append("input")
                    .attr("class", "SearchBar")
                    .attr("id", "search")
                    .attr("type", "text")
                    .attr("placeholder", "Search...")
                    .style("font-family", "inherit")
                    .style("font-size", "16");

                  d3.select("#viz_container").append("div")
                    .attr("id", "table_container")
                    .attr("width", '950px')
                    .attr("height", '575px');

                  var table = d3.select("#table_container").append("table").attr("id", "tab");
                  table.append("thead").append("tr");

                  var headers = table.select("tr").selectAll("th")
                    .data(column_names)
                    .enter()
                    .append("th")
                    .text(function(d) {
                      return d;
                    });

                  var rows, row_entries, row_entries_no_anchor, row_entries_with_anchor;

                  // draw table body with rows
                  table.append("tbody")

                  // data bind
                  rows = table.select("tbody").selectAll("tr")
                    .data(table_data, function(d) {
                      return d.coc_number;
                    });

                  // enter the rows
                  rows.enter()
                    .append("tr")

                  // enter td's in each row
                  row_entries = rows.selectAll("td")
                    .data(function(d) {
                      var arr = [];
                      for (var k in d) {
                        if (d.hasOwnProperty(k)) {
                          arr.push(d[k]);
                        }
                      }
                      return [arr[0], arr[1], arr[2], arr[3], arr[4], arr[7], arr[8], arr[5], arr[6], arr[9]];
                    })
                    .enter()
                    .append("td")

                  // draw row entries with no anchor
                  row_entries_no_anchor = row_entries.filter(function(d) {
                    return (/https?:\/\//.test(d) == false)
                  })
                  row_entries_no_anchor.text(function(d) {
                    return d;
                  })

                  // draw row entries with anchor
                  row_entries_with_anchor = row_entries.filter(function(d) {
                    return (/https?:\/\//.test(d) == true)
                  })
                  row_entries_with_anchor
                    .append("a")
                    .attr("href", function(d) {
                      return d;
                    })
                    .attr("target", "_blank")
                    .text(function(d) {
                      return d;
                    })

                  /**  search functionality **/
                  d3.select("#search")
                    .on("keyup", function() { // filter according to key pressed
                      var searched_data = table_data,
                        text = this.value.trim();

                      var searchResults = searched_data.map(function(r) {
                        var regex = new RegExp("^" + text, "i");
                        if (regex.test(r.coc_name)) { // if there are any results
                          return regex.exec(r.coc_name)[0]; // return them to searchResults
                        }
                      })

                      // filter blank entries from searchResults
                      searchResults = searchResults.filter(function(r) {
                        return r != undefined;
                      })

                      // filter dataset with searchResults
                      searched_data = searchResults.map(function(r) {
                        return table_data.filter(function(p) {
                          return p.coc_name.indexOf(r) != -1;
                        })
                      })

                      // flatten array
                      searched_data = [].concat.apply([], searched_data)

                      // data bind with new data
                      rows = table.select("tbody").selectAll("tr")
                        .data(searched_data, function(d) {
                          return d.coc_number;
                        })
                        .attr("class", "panel_1_table");

                      // enter the rows
                      rows.enter()
                        .append("tr");

                      // enter td's in each row
                      row_entries = rows.selectAll("td")
                        .data(function(d) {
                          var arr = [];
                          for (var k in d) {
                            if (d.hasOwnProperty(k)) {
                              arr.push(d[k]);
                            }
                          }
                          return [arr[0], arr[1], arr[2], arr[3], arr[4], arr[7], arr[8], arr[5], arr[6], arr[9]];
                        })
                        .enter()
                        .append("td")

                      // draw row entries with no anchor
                      row_entries_no_anchor = row_entries.filter(function(d) {
                        return (/https?:\/\//.test(d) == false)
                      })
                      row_entries_no_anchor.text(function(d) {
                        return d;
                      })

                      // draw row entries with anchor
                      row_entries_with_anchor = row_entries.filter(function(d) {
                        return (/https?:\/\//.test(d) == true)
                      })
                      row_entries_with_anchor
                        .append("a")
                        .attr("href", function(d) {
                          return d;
                        })
                        .attr("target", "_blank")
                        .text(function(d) {
                          return d;
                        })

                      // exit
                      rows.exit().remove();
                    })

                  /**  sort functionality **/
                  headers.on("click", function(d) {
                    if (d == "CoC Number") {
                      clicks.coc_number++
                        if (clicks.coc_number % 2 == 0) {
                          rows.sort(function(a, b) {
                            return a.coc_number.localeCompare(b.coc_number);
                          })
                        } else
                      if (clicks.coc_number % 2 !== 0) {
                        rows.sort(function(a, b) {
                          return b.coc_number.localeCompare(a.coc_number);
                        })
                      }
                    }

                    if (d == "CoC Name") {
                      clicks.coc_name++
                        if (clicks.coc_name % 2 == 0) {
                          rows.sort(function(a, b) {
                            return a.coc_name.localeCompare(b.coc_name);
                          })
                        } else
                      if (clicks.coc_name % 2 !== 0) {
                        rows.sort(function(a, b) {
                          return b.coc_name.localeCompare(a.coc_name);
                        })
                      }
                    }

                    if (d == "Total Homeless") {
                      clicks.total_homeless++;
                      console.log("rows.total_homeless: ", rows.total_homeless)
                      if (clicks.total_homeless % 2 == 0) {
                        // sort ascending: numerically
                        rows.sort(function(a, b) {
                          if (+a.total_homeless < +b.total_homeless) {
                            return -1;
                          } else if (+a.total_homeless > +b.total_homeless) {
                            return 1;
                          } else {
                            return 0;
                          }
                        });
                        // odd number of clicks
                      } else if (clicks.total_homeless % 2 !== 0) {
                        // sort descending: numerically
                        rows.sort(function(a, b) {
                          if (+b.total_homeless > +a.total_homeless) {
                            return 1;
                          } else if (+b.total_homeless < +a.total_homeless) {
                            return -1;
                          } else {
                            return 0;
                          }
                        });
                      }
                    }

                    if (d == "Chronically Homeless") {
                      clicks.chronically_homeless++;
                      // even number of clicks
                      if (clicks.chronically_homeless % 2 == 0) {
                        // sort ascending: alphabetically
                        rows.sort(function(a, b) {
                          if (a.chronically_homeless < b.chronically_homeless) {
                            return -1;
                          } else if (a.chronically_homeless > b.chronically_homeless) {
                            return 1;
                          }
                        });
                        // odd number of clicks
                      } else if (clicks.chronically_homeless % 2 !== 0) {
                        // sort descending: alphabetically
                        rows.sort(function(a, b) {
                          if (a.chronically_homeless < b.chronically_homeless) {
                            return 1;
                          } else if (a.chronically_homeless > b.chronically_homeless) {
                            return -1;
                          }
                        });
                      }
                    }
                    if (d == "Sheltered Homeless") {
                      clicks.sheltered_homeless++;
                      // even number of clicks
                      if (clicks.sheltered_homeless % 2 == 0) {
                        // sort ascending: numerically
                        rows.sort(function(a, b) {
                          if (+a.sheltered_homeless < +b.sheltered_homeless) {
                            return -1;
                          } else if (+a.sheltered_homeless > +b.sheltered_homeless) {
                            return 1;
                          }
                        });
                        // odd number of clicks
                      } else if (clicks.sheltered_homeless % 2 !== 0) {
                        // sort descending: numerically
                        rows.sort(function(a, b) {
                          if (+a.sheltered_homeless < +b.sheltered_homeless) {
                            return 1;
                          } else if (+a.sheltered_homeless > +b.sheltered_homeless) {
                            return -1;
                          }
                        });
                      }
                    }
                    if (d == "Unsheltered Homeless") {
                      clicks.unsheltered_homeless++;
                      // even number of clicks
                      if (clicks.unsheltered_homeless % 2 == 0) {
                        // sort ascending: numerically
                        rows.sort(function(a, b) {
                          if (+a.unsheltered_homeless < +b.unsheltered_homeless) {
                            return -1;
                          } else if (+a.unsheltered_homeless > +b.unsheltered_homeless) {
                            return 1;
                          }
                        });
                        // odd number of clicks
                      } else if (clicks.unsheltered_homeless % 2 !== 0) {
                        // sort descending: numerically
                        rows.sort(function(a, b) {
                          if (+a.unsheltered_homeless < +b.unsheltered_homeless) {
                            return 1;
                          } else if (+a.unsheltered_homeless > +b.unsheltered_homeless) {
                            return -1;
                          }
                        });
                      }
                    }
                    if (d == "Homeless Veterans") {
                      clicks.homeless_veterans++;
                      // even number of clicks
                      if (clicks.homeless_veterans % 2 == 0) {
                        // sort ascending: numerically
                        rows.sort(function(a, b) {
                          if (+a.homeless_veterans < +b.homeless_veterans) {
                            return -1;
                          } else if (+a.homeless_veterans > +b.homeless_veterans) {
                            return 1;
                          }
                        });
                        // odd number of clicks
                      } else if (clicks.homeless_veterans % 2 !== 0) {
                        // sort descending: numerically
                        rows.sort(function(a, b) {
                          if (+a.homeless_veterans < +b.homeless_veterans) {
                            return 1;
                          } else if (+a.homeless_veterans > +b.homeless_veterans) {
                            return -1;
                          }
                        });
                      }
                    }
                    if (d == "Homeless Individuals") {
                      clicks.homeless_individuals++;
                      // even number of clicks
                      if (clicks.homeless_individuals % 2 == 0) {
                        // sort ascending: numerically
                        rows.sort(function(a, b) {
                          if (+a.homeless_individuals < +b.homeless_individuals) {
                            return -1;
                          } else if (+a.homeless_individuals > +b.homeless_individuals) {
                            return 1;
                          }
                        });
                        // odd number of clicks
                      } else if (clicks.homeless_individuals % 2 !== 0) {
                        // sort descending: numerically
                        rows.sort(function(a, b) {
                          if (+a.homeless_individuals < +b.homeless_individuals) {
                            return 1;
                          } else if (+a.homeless_individuals > +b.homeless_individuals) {
                            return -1;
                          }
                        });
                      }
                    }
                    if (d == "Homeless People in Families") {
                      clicks.homeless_people_in_families++;
                      // even number of clicks
                      if (clicks.homeless_people_in_families % 2 == 0) {
                        // sort ascending: numerically
                        rows.sort(function(a, b) {
                          if (+a.homeless_people_in_families < +b.homeless_people_in_families) {
                            return -1;
                          } else if (+a.homeless_people_in_families > +b.homeless_people_in_families) {
                            return 1;
                          }
                        });
                        // odd number of clicks
                      } else if (clicks.homeless_people_in_families % 2 !== 0) {
                        // sort descending: numerically
                        rows.sort(function(a, b) {
                          if (+a.homeless_people_in_families < +b.homeless_people_in_families) {
                            return 1;
                          } else if (+a.homeless_people_in_families > +b.homeless_people_in_families) {
                            return -1;
                          }
                        });
                      }
                    }
                    if (d == "Homeless Unaccompanied Youth (Under 25)") {
                      clicks.homeless_unaccompanied_youth++;
                      // even number of clicks
                      if (clicks.homeless_unaccompanied_youth % 2 == 0) {
                        // sort ascending: numerically
                        rows.sort(function(a, b) {
                          if (+a.homeless_unaccompanied_youth < +b.homeless_unaccompanied_youth) {
                            return -1;
                          } else if (+a.homeless_unaccompanied_youth > +b.homeless_unaccompanied_youth) {
                            return 1;
                          }
                        });
                        // odd number of clicks
                      } else if (clicks.homeless_unaccompanied_youth % 2 !== 0) {
                        // sort descending: numerically
                        rows.sort(function(a, b) {
                          if (+a.homeless_unaccompanied_youth < +b.homeless_unaccompanied_youth) {
                            return 1;
                          } else if (+a.homeless_unaccompanied_youth > +b.homeless_unaccompanied_youth) {
                            return -1;
                          }
                        });
                      }
                    }
                  }) // end of click listeners

                  //Scrollable body, frozen headers
                  document.getElementById("table_container").addEventListener("scroll", function() {
                    var translate = "translate(0," + this.scrollTop + "px)";
                    this.querySelector("thead").style.transform = translate;
                  });
                } // end of GenTable()

                function GenPanelTwo() {

                  spinner_panel2.stop();

                  var abs_width = 1024,
                    abs_height = 575,
                    margin = {
                      top: 100,
                      right: 50,
                      bottom: 15,
                      left: 100
                    },
                    panel_2_width = abs_width - margin.left - margin.right,
                    panel_2_height = abs_height - margin.top - margin.bottom,
                    matrix_width = abs_width / 1.85 - margin.left - margin.right,
                    matrix_height = abs_height - margin.top - margin.bottom,
                    map_width = panel_2_width - matrix_width - margin.left - margin.right,
                    map_height = panel_2_height / 3,
                    info_width = panel_2_width - matrix_width - margin.left - margin.right,
                    info_height = panel_2_height / 3
                  centered = null;

                  var svg_1 = d3.select("#panel_map")
                    .append("svg")
                    .attr("width", map_width + margin.left + margin.right)
                    .attr("height", map_height + margin.top + margin.bottom);

                  var svg_2 = d3.select("#panel_info")
                    .append("svg")
                    .attr("width", info_width + margin.left + margin.right)
                    .attr("height", info_height + margin.top + margin.bottom);

									var svg_3 = d3.select("#panel_coc")
                    .append("svg")
                    .attr("width", info_width + margin.left + margin.right)
                    .attr("height", info_height + margin.top + margin.bottom);

                  var svg = d3.select("#panel_matrix").append("svg")
                    /*.attr("width", matrix_width + margin.left + margin.right)
                    .attr("height", matrix_height + margin.top + margin.bottom)*/
										.attr("width", map_width + margin.left + margin.right)
										.attr("height", map_height + margin.top + margin.bottom+30)
										.style("margin-left", -margin.left / 2.5 + "px")
                    .attr("transform", "translate(" + 40 + "," + 10 + ")");


                  var tip = d3.tip()
                    .attr("class", "d3-tip")
                    .offset([-10, 0])
                    .html(function(d) {
                      return d.properties.COCNAME + "<br>" + "Continuum of Care Number: " + d.properties.coc_number;
                    });

                  svg_1.call(tip)

                  bar_chrt.forEach(function(d) {
                    d.fed_funding = +d.fed_funding;
                  });

                  map_data.forEach(function(d) {
                    d.fed_funding = +d.fed_funding;
                  });

                  bar_chrt = bar_chrt.sort(function(x, y) {
                    return d3.descending(x.fed_funding, y.fed_funding);
                  });


                  function filter_cocNum(bar_chrt) {
                    return bar_chrt.coc_number == "CA-600";
                  }

                  function filter_cfdaAmount(x) {
                    return x.fed_funding > 0;
                  }

                  var initial = bar_chrt.filter(filter_cocNum);
                  var initial_bar = initial.filter(filter_cfdaAmount);

                  //console.log("initial_bar: ", initial_bar)

                  var formatNumber = d3.format("$,");

                  var axisMargin = 5,
                    x_width = 470,
                    barHeight = 18,
                    barPadding = 5,
                    bar, scale, xAxis, labelWidth = 0;

                  max = d3.max(initial_bar, function(d) {
                    return d.fed_funding;
                  });

                  bar = svg.selectAll("g")
                    .data(initial_bar)
                    .enter()
                    .append("g");

                  bar.attr("class", "bar")
                    .attr("cx", 0)
                    .style("fill", function(d) {
                      if (d.category == "Housing") {
                        return "#7B4C66"
                      } else if (d.category == "Housing/Education") {
                        return "#C98845"
                      } else if (d.category == "Services") {
                        return "#695C7C"
                      } else if (d.category == "Health") {
                        return "#297B84"
                      } else if (d.category == "Support Services") {
                        return "#4A8D5B"
                      } else if (d.category == "Housing/Services") {
                        return "#759043"
                      } else if (d.category == "Health/Housing") {
                        return "#A08E39"
                      } else if (d.category == "Education/Servicess") {
                        return "#4A6C87"
                      } else if (d.category == "Housing/Research") {
                        return "#278673"
                      }
                    })
                    .attr("transform", function(d, i) {
                      return "translate(0," + (i * (barHeight + barPadding)) + ")";
                    });

                  bar.append("text")
                    .attr("class", "label")
                    .attr("x", 15)
                    .attr("y", barHeight / 2)
                    .attr("dy", ".35em") //vertical align middle
                    .text(function(d) {
                      return d.cfda_number;
                    }).each(function() {
                      labelWidth = 50;
                    });

                  scale = d3.scale.linear()
                    .domain([0, max])
                    .range([0, x_width - labelWidth]);

                  xAxis = d3.svg.axis()
                    //.orient("bottom")
                    .scale(scale)
                    .tickSize(-svg[0][0].attributes[1].nodeValue + axisMargin)
                    .tickFormat(function(d) {
                      return formatNumber(d);
                    });

                  yAxis = d3.svg.axis()
                    .orient("left");

                  bar.append("rect")
                    .attr("transform", "translate(" + (labelWidth) + ",0)")
                    .attr("margin-left", 5)
                    //.attr("rx","30")
                    .attr("height", barHeight)
                    .attr("width", function(d) {
                      return scale(d.fed_funding);
                    });

                  svg.insert("g", ":first-child")
                    .attr("class", "axisHorizontal")
                    .attr("transform", "translate(" + labelWidth + "," + 255 + ")")
                    .call(xAxis)
                    .selectAll("text")
                    .attr("y", 10)
                    .attr("x", 0)
                    .attr("dy", ".35em")
                    .attr("transform", "rotate(-35)")
                    .style("font-size", "12")
                    .style("text-anchor", "end");

                  svg.insert("g", ":first-child")
                    .classed("y axis", true)
                    .call(yAxis)
                    .append("text")
                    .classed("label", true)
                    .attr("transform", "rotate(-90)")
                    .attr("x", -80)
                    .attr("y", 0)
                    .attr("dy", ".71em")
                    .style("text-anchor", "end")
                    .text("Homeless CFDA Programs");

                  //MAP
                  var projection = d3.geo.albersUsa()
                    .translate([map_width / 1.35, map_height / 1.1]) // translate to center of screen
                    .scale([575]); // scale things down so see entire US ---1455

                  // Define path generator
                  var path = d3.geo.path() // path generator that will convert GeoJSON to SVG paths
                    .projection(projection); // tell path generator to use albersUsa projection

                  var centered = null;

                  //console.log("Map_Data: ",map_data)

                  var g = svg_1.append("g");

                  //var OnMouseOver = "BarChart; tip.show"

                  g.selectAll("path")
                    .data(us.features)
                    .enter().append("path")
                    .attr("d", path)
                    .attr("class", "counties_mini")
                    .attr("data-coc", function(d) {
                      return d.properties.coc_number;
                    })
                    .attr("data-state", function(d) {
                      return d.properties.state;
                    })
                    .attr("data-name", function(d) {
                      return d.properties.name;
                    })
                    .attr("d", path)
                    .on("click", clicked)
                    .style("fill", getColor)
                    .on("mouseover", function(d) {
                      tip.show(d);
                      BarChart(d);
                    })
                   /*.on("mouseout", tip.hide);*/


                  function clicked(d) {
                    var x, y, k;

                    //console.log("In panel 2 clicked, d: ", d);

                    for (var i = 0; i < states.length; i++) {
                      if (d.properties.STUSAB == states[i].Abbrv) {
                        for (var h = 0; h < json.features.length; h++) {
                          if (states[i].State == json.features[h].properties.NAME) {
                            var n = json.features[h]
                            //console.log("clicked n: ",n);
                            if (n && centered !== n) {
                              var centroid = path.centroid(n)
                              x = centroid[0]
                              y = centroid[1]

                              //console.log("d: ",d.properties.NAME);
                              if (n.properties.NAME === "Florida") {
                                k = 5.0
                              } else if (n.properties.NAME === "Michigan") {
                                k = 5.5
                              } else if (n.properties.NAME === "Idaho") {
                                k = 3.25
                              } else if (n.properties.NAME === "Alaska") {
                                k = 5.0
                              } else if (n.properties.NAME === "Hawaii") {
                                k = 7.0
                              } else if (n.properties.CENSUSAREA <= 15000) {
                                k = 11.0
                              } else if (n.properties.CENSUSAREA > 15000 && n.properties.CENSUSAREA <= 30000) {
                                k = 9.0
                              } else if (n.properties.CENSUSAREA > 30000 && n.properties.CENSUSAREA <= 50000) {
                                k = 8.0
                              } else if (n.properties.CENSUSAREA > 50000 && n.properties.CENSUSAREA <= 70000) {
                                k = 6.5
                              } else if (n.properties.CENSUSAREA > 70000 && n.properties.CENSUSAREA <= 90000) {
                                k = 6.0
                              } else if (n.properties.CENSUSAREA > 90000 && n.properties.CENSUSAREA <= 110000) {
                                k = 5.0
                              } else if (n.properties.CENSUSAREA > 110000 && n.properties.CENSUSAREA <= 130000) {
                                k = 4.0
                              } else if (n.properties.CENSUSAREA > 130000 && n.properties.CENSUSAREA <= 150000) {
                                k = 3.5
                              } else {
                                k = 2.75
                              };
                              centered = n;

                            } else {
                              x = map_width / 1.35;
                              y = map_height / 1.1;
                              k = 1;
                              centered = null;

                            }
                            g.select("path")
                              .on("mouseover", function(d) {
                                tip.show(d);
                                BarChart(d);
                              })
                              .on("mouseout", tip.hide);

                            g.selectAll("path")
                              .classed("active", centered && function(d) {
                                return d === centered;
                              });

                            g.transition()
                              .duration(750)
                              .attr("transform", "translate(" + map_width / 1.35 + "," + map_height / 1.1 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
                              .style("stroke-width", .15 / k + "px");
                          }
                        }
                      }
                    }
                  }

                  function getColor(d) {
                    for (var i = 0; i < map_data.length; i++) {
                      if (d.properties.coc_number === map_data[i].COC_Number) {
                        if (map_data[i].amount <= 500000) {
                          return ("#8EC6F6");
                        } else if (map_data[i].amount <= 1000000) {
                          return ("#87BBE9");
                        } else if (map_data[i].amount <= 2000000) {
                          return ("#81B0DC");
                        } else if (map_data[i].amount <= 3000000) {
                          return ("#7AA5CF");
                        } else if (map_data[i].amount <= 4000000) {
                          return ("#739BC2");
                        } else if (map_data[i].amount <= 5000000) {
                          return ("#6C90B6");
                        } else if (map_data[i].amount <= 7500000) {
                          return ("#6686A9");
                        } else if (map_data[i].amount <= 10000000) {
                          return ("#5F7C9D");
                        } else if (map_data[i].amount <= 20000000) {
                          return ("#587291");
                        } else if (map_data[i].amount <= 30000000) {
                          return ("#516885");
                        } else if (map_data[i].amount <= 40000000) {
                          return ("#4A5E79");
                        } else if (map_data[i].amount <= 50000000) {
                          return ("#43556E");
                        } else if (map_data[i].amount <= 60000000) {
                          return ("#3C4C62");
                        } else if (map_data[i].amount <= 70000000) {
                          return ("#364357");
                        } else if (map_data[i].amount <= 80000000) {
                          return ("#2F3A4C");
                        } else if (map_data[i].amount <= 90000000) {
                          return ("#283142");
                        } else if (map_data[i].amount <= 100000000) {
                          return ("#212937");
                        } else {
                          return ("#1B212D")
                        }
                      }
                    }
                  }

                  function BarChart(d) {

                    d3.select('#panel_matrix > svg').remove()

                    var svg = d3.select("#panel_matrix").append("svg")
                      .attr("width", matrix_width + margin.left + margin.right)
                      .attr("height", matrix_height + margin.top + margin.bottom)
                      .style("margin-left", -margin.left / 2.5 + "px")
                      .attr("transform", "translate(" + 40 + "," + 10 + ")");

                    function filter_cocNum(bar_chrt) {
                      return bar_chrt.coc_number == d.properties.coc_number;
                    }

                    function filter_cfdaAmount(x) {
                      return x.fed_funding > 0;
                    }

                    var initial = bar_chrt.filter(filter_cocNum);
                    var initial_bar = initial.filter(filter_cfdaAmount);
                    var formatNumber = d3.format("$,");

                    var axisMargin = 5,
                      x_width = 470,
                      barHeight = 18,
                      barPadding = 5,
                      bar, scale, xAxis, labelWidth = 0;

                    max = d3.max(initial_bar, function(d) {
                      return d.fed_funding;
                    });

                    bar = svg.selectAll("g")
                      .data(initial_bar)
                      .enter()
                      .append("g");

                    bar.attr("class", "bar")
                      .attr("cx", 0)
                      .style("fill", function(d) {
                        if (d.category == "Housing") {
                          return "#7B4C66"
                        } else if (d.category == "Housing/Education") {
                          return "#C98845"
                        } else if (d.category == "Services") {
                          return "#695C7C"
                        } else if (d.category == "Health") {
                          return "#297B84"
                        } else if (d.category == "Support Services") {
                          return "#4A8D5B"
                        } else if (d.category == "Housing/Services") {
                          return "#759043"
                        } else if (d.category == "Health/Housing") {
                          return "#A08E39"
                        } else if (d.category == "Education/Servicess") {
                          return "#4A6C87"
                        } else if (d.category == "Housing/Research") {
                          return "#278673"
                        }
                      })
                      .attr("transform", function(d, i) {
                        return "translate(0," + (i * (barHeight + barPadding)) + ")";
                      });

                    bar.append("text")
                      .attr("class", "label")
                      .attr("x", 15)
                      .attr("y", barHeight / 2)
                      .attr("dy", ".35em") //vertical align middle
                      .text(function(d) {
                        return d.cfda_number;
                      }).each(function() {
                        labelWidth = 50;
                      });

                    scale = d3.scale.linear()
                      .domain([0, max])
                      .range([0, x_width - labelWidth]);

                    xAxis = d3.svg.axis()
                      //.orient("bottom")
                      .scale(scale)
                      .tickSize(-svg[0][0].attributes[1].nodeValue + axisMargin)
                      .tickFormat(function(d) {
                        return formatNumber(d);
                      });

                    yAxis = d3.svg.axis()
                      .orient("left");

                    bar.append("rect")
                      .attr("transform", "translate(" + (labelWidth) + ",0)")
                      .attr("margin-left", 5)
                      //.attr("rx","30")
                      .attr("height", barHeight)
                      .attr("width", function(d) {
                        return scale(d.fed_funding);
                      });

                    svg.insert("g", ":first-child")
                      .attr("class", "axisHorizontal")
                      .attr("transform", "translate(" + labelWidth + "," + 255 + ")")
                      .call(xAxis)
                      .selectAll("text")
                      .attr("y", 10)
                      .attr("x", 0)
                      .attr("dy", ".35em")
                      .attr("transform", "rotate(-35)")
                      .style("font-size", "12")
                      .style("text-anchor", "end");

                    svg.insert("g", ":first-child")
                      .classed("y axis", true)
                      .call(yAxis)
                      .append("text")
                      .classed("label", true)
                      .attr("transform", "rotate(-90)")
                      .attr("x", -80)
                      .attr("y", 0)
                      .attr("dy", ".71em")
                      .style("text-anchor", "end")
                      .text("Homeless CFDA Programs");
                  }
                } // end of GenPanelTwo

                function GenScatter() {

                  spinner_panel3.stop();

                  var formatNumber = d3.format("$,");
                  var formatNumberNew = d3.format("$,.2");

                  var margin = {
                      top: 50,
                      right: 0,
                      bottom: 50,
                      left: 120
                    },
                    outerWidth = 700,
                    outerHeight = 700,
                    width = outerWidth - margin.left - margin.right,
                    height = outerHeight - margin.top - margin.bottom;

                  var x = d3.scale.linear()
                    .range([0, width]).nice();

                  var y = d3.scale.linear()
                    .range([height, 0]).nice();

                  var xCat = "total_homeless",
                    yCat = "value",
                    colorCat = "Bin";

                  var xMax = d3.max(scatter_data, function(d) {
                      return d[xCat];
                    }) * 1.08,
                    xMin = d3.min(scatter_data, function(d) {
                      return d[xCat];
                    }),
                    xMin = xMin > 0 ? 0 : xMin,
                    yMax = d3.max(scatter_data, function(d) {
                      return d[yCat];
                    }) * 1.08,
                    yMin = d3.min(scatter_data, function(d) {
                      return d[yCat];
                    }),
                    yMin = yMin > 0 ? 0 : yMin;

                  x.domain([xMin, xMax]);
                  y.domain([yMin, yMax]);

                  var xAxis = d3.svg.axis()
                    .scale(x)
                    .orient("bottom")
                    .tickSize(-height);

                  var yAxis = d3.svg.axis()
                    .scale(y)
                    .orient("left")
                    .tickFormat(d3.format("$,"))
                    .tickSize(-width);

                  var color = d3.scale.category20c();

                  function transform(d) {
                    return "translate(" + x(d[xCat]) + "," + y(d[yCat]) + ")";
                  }

                  var tip = d3.tip()
                    .attr("class", "d3-tip")
                    .offset([-10, 0])
                    .html(function(d) {
                      var per = d[yCat] / d[xCat];
                      return d["coc_number"] + "<br>"
                        /*+ "Continuum of Care Number: "+  d["coc_number"] +"<br>"*/
                        +
                        "2017 CFDA Program Funds Related to Homelessness Awarded: " + formatNumber(d[yCat]) + "<br>" +
                        "Total Homeless: " + d["total_homeless"] + "<br>"
                        /*  + "Number of Instructional staff: "+ "<b>" +d["No_Staff"] + "</b>" + "<br>"
                        	+ "Grant $s per Instructor: "+ "<b>" +formatNumber(Math.floor(d[yCat]/d[xCat])) + "</b>" +"<br>"*/
                        +
                        "<b>" + d["Type"] + "</b>";
                    });

                  var zoomBeh = d3.behavior.zoom()
                    .x(x)
                    .y(y)
                    .scaleExtent([0, 500])
                    .on("zoom", zoom);

                  var svg = d3.select("#scatter")
                    .append("svg")
                    .attr("width", outerWidth)
                    .attr("height", outerHeight)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                    .call(zoomBeh);

                  svg.call(tip);

                  svg.append("rect")
                    .attr("class", "scatter")
                    .attr("width", width)
                    .attr("height", height)
                    .style("fill", "#ddd");

                  svg.append("g")
                    .classed("x axis", true)
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis)
                    .append("text")
                    .classed("label", true)
                    .attr("x", width / 2)
                    .attr("y", margin.bottom - 10)
                    .style("text-anchor", "middle")
                    .text("Number of Homeless");

                  svg.append("g")
                    .classed("y axis", true)
                    .call(yAxis)
                    .append("text")
                    .classed("label", true)
                    .attr("transform", "rotate(-90)")
                    .attr("x", -100)
                    .attr("y", -margin.left + 10)
                    .attr("dy", ".71em")
                    .style("text-anchor", "end")
                    .text("Homeless CFDA Program Funds $");

                  var objects = svg.append("svg")
                    .classed("objects", true)
                    .attr("width", width)
                    .attr("height", height);

                  objects.append("svg:line")
                    .classed("axisLine hAxisLine", true)
                    .attr("x1", 0)
                    .attr("y1", 0)
                    .attr("x2", width)
                    .attr("y2", 0)
                    .attr("transform", "translate(0," + height + ")");

                  objects.append("svg:line")
                    .classed("axisLine vAxisLine", true)
                    .attr("x1", 0)
                    .attr("y1", 0)
                    .attr("x2", 0)
                    .attr("y2", height);

                  objects.selectAll(".dot")
                    .data(scatter_data)
                    .enter().append("circle")
                    .classed("dot", true)
                    .attr("r", function(d) {
                      return 7 * Math.sqrt(4 / Math.PI);
                    })
                    .attr("transform", transform)
                    .style("fill", function(d) {
                      return color(d[colorCat]);
                    })
                    .on("mouseover", tip.show)
                    .on("mouseout", tip.hide);

                  function change() {
                    xCat = "total_homeless";
                    xMax = d3.max(scatter_data, function(d) {
                      return d[xCat];
                    });
                    xMin = d3.min(scatter_data, function(d) {
                      return d[xCat];
                    });
                    yCat = "value"
                    yMax = d3.max(scatter_data, function(d) {
                      return d[yCat];
                    });
                    yMin = d3.min(scatter_data, function(d) {
                      return d[yCat];
                    });
                    zoomBeh.x(x.domain([0, xMax * 1.05])).y(y.domain([0, yMax * 1.05]));

                    var svg = d3.select("#scatter").transition();

                    svg.select(".x.axis").duration(750).call(xAxis).select(".label").text("Number of Homeless");
                    svg.select(".y.axis").duration(750).call(yAxis).select(".label").text("Homeless CFDA Program Funds $");

                    objects.selectAll(".dot").transition().duration(1000).attr("transform", transform);
                  }

                  function zoom() {
                    svg.select(".x.axis").call(xAxis);
                    svg.select(".y.axis").call(yAxis);

                    svg.selectAll(".dot")
                      .attr("transform", transform);
                  }

                  d3.select("input[type=button]").on("click", change);
                }
              })
            })
          })
        })
      })
    })
  })
})
