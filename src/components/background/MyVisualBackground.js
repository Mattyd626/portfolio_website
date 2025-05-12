import React from "react";
import P5Wrapper from "./P5Wrapper";
import mySketch from "./Sketch";

const Background = ({ gravity }) => {
  return (
    <div style={{ position: 'absolute', top: '0px', left: '0px', margin: "0px", padding: "0px", overflow: "hidden", zIndex: -1 }}>
      <P5Wrapper sketch={mySketch(gravity)} />
    </div>
  );
}


export default Background;