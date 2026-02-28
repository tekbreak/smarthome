import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { Box } from "@mui/material";

export const HomeMap = () => {
  const ref = useRef();

  const poly = [
    { x: 0.0, y: 25.0 },
    { x: 8.5, y: 23.4 },
    { x: 13.0, y: 21.0 },
    { x: 19.0, y: 15.5 },
  ];

  useEffect(() => {
    const svgElement = d3.select(ref.current);
    svgElement.selectAll("*").remove();
    //   .append("polygon")
    //   .data(poly)
    //   .style("stroke", "black")
    //   .style("stroke-width", 5);
    svgElement
      .append("polygon")
      .attr("points", "0,0 200,50 250,100 250,150 20,50")
      .attr("stroke", "#f00")
      .attr("fill", "none");
  }, []);

  return (
    <Box sx={{ padding: "5em" }}>
      <svg ref={ref} />
    </Box>
  );
};
