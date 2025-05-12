import Blackholeshader from "./BlackholeShader";

const normalize = (vec) => {
    const length = Math.sqrt(vec.reduce((acc, val) => acc + val * val, 0));
    return vec.map((v) => v / length);
};

const subtract = (vec1, vec2) => {
    return vec1.map((value, index) => value - vec2[index]);
}

const cross = (a, b) => {
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0]
    ];
}

const computeCameraMatrix = (eye, lookAt) => {
    const up = [0, 1, 0];
    const z = normalize(subtract(eye, lookAt));
    const x = normalize(cross(up, z));
    const y = cross(z, x);  
    return [
        x[0], y[0], z[0], 0,
        x[1], y[1], z[1], 0,
        x[2], y[2], z[2], 0,
        0,    0,    0,    1,
    ];
}

const radians = (deg) => deg * (Math.PI / 180);

const Sketch = (gravity) => (p) => {

    const eye = [0, 0, 15];
    const lookAt = [0, 0, 0];
    let shader;

    p.setup = () => {
        p.createCanvas(window.innerWidth, window.innerHeight-4, p.WEBGL);
        p.background(100);
        shader = p.createFilterShader(Blackholeshader);
    };
    
    p.windowResized = () => {
        p.resizeCanvas(window.innerWidth, window.innerHeight-4);
    };

    p.draw = () => {
        lookAt[0] = -(p.mouseX - p.width / 2.0) / p.width * 2;
        lookAt[1] = -(p.mouseY - p.height / 2.0) / p.height * 2;
        const cameraMatrix = computeCameraMatrix(eye, lookAt);
        shader.setUniform("cameraMatrix", cameraMatrix);
        shader.setUniform("eye", eye);
        shader.setUniform("aspect", p.width / p.height);
        shader.setUniform("fov", radians(90));
        shader.setUniform("resolution", [p.width, p.height]);
        shader.setUniform("time", p.millis() / 1000.0);
        shader.setUniform("gravity", gravity);
        p.filter(shader);
    };
};
  
export default Sketch;