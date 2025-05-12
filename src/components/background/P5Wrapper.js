import React, { useRef, useEffect } from "react";
import p5 from "p5";

const P5Wrapper = ({ sketch }) => {
  const canvasRef = useRef();

  useEffect(() => {
    const p5Instance = new p5(sketch, canvasRef.current);

    return () => {
      p5Instance.remove();
    };
  }, [sketch]);

  return <div ref={canvasRef} style={{margin: "0px", padding: "0px", overflow: "hidden"}}></div>;
};

export default P5Wrapper;