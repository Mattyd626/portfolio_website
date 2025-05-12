const shader = `
precision mediump float;

uniform mat4 cameraMatrix;
uniform vec3 eye;
uniform float fov;
uniform float aspect;
uniform vec2 resolution;
uniform float time;
uniform float gravity;

vec3 target = vec3(0,0,0);
float radius = 3.0;
float epsilon = 0.01;

float hash(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
  
vec3 getRayDirection(vec2 uv) {
  vec2 screen = uv * 2.0 - 1.0;
  screen.x *= aspect;

  vec3 ray = normalize(vec3(screen * tan(fov / 2.0), -1.0));
  vec3 worldRay = normalize((cameraMatrix * vec4(ray, 0.0)).xyz);
  return worldRay;
}
  

vec3 applyGravity(vec3 position, vec3 dir, float distance, float step){
  float force = gravity / (distance * distance);
  force = ((force + 0.000001) / (force + 1.0)) * step;
  vec3 towards = normalize(target - position);

  return normalize(dir * (1.0 - force) + towards * force);
}


vec3 rayMarch(vec3 position, vec3 dir){
  for(int i = 0; i < 50; i++){
    float d = distance(position, target);
    if (d < radius + epsilon){
      return vec3(0, 0, 0);
    }
    float step = min(d, 1.0);
    dir = applyGravity(position, dir, d, step);
    position += dir * step;
  }

  vec3 cell = floor(dir * 400.0);
  float h = hash(cell); 
  float twinkle = sin(h * 10000.0 + time * 5.0); // Uniform time
  float brightness = smoothstep(0.995, 1.0, h) * (0.9 + 0.1 * twinkle);
  
  return 0.5 + 0.5 * dir + brightness;
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  vec3 rayDir = getRayDirection(uv);
  vec3 color = rayMarch(eye, rayDir);
  gl_FragColor = vec4(color, 1.0);
}

`;

export default shader;