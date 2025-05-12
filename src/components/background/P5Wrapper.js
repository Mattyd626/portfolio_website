import { useRef, useEffect } from "react";
import p5 from "p5";

const P5Wrapper = ({ sketch, ...props }) => {
  const canvasRef = useRef();
  const p5Ref = useRef();

  useEffect(() => {
    p5Ref.current = new p5((p) => sketch(p), canvasRef.current);

    return () => {
      p5Ref.current.remove();
    };
  }, [sketch]);

  useEffect(() => {
    if (p5Ref.current) {
      Object.entries(props).forEach(([key, value]) => {
        p5Ref.current[key] = value;
      });
    }
  }, [props]);

  return <div ref={canvasRef} style={{margin: "0px", padding: "0px", overflow: "hidden"}}></div>;
};

export default P5Wrapper;