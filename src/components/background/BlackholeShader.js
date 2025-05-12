const shader = `
precision highp float;
precision highp int;

uniform mat4 cameraMatrix;
uniform vec3 eye;
uniform float fov;
uniform float aspect;
uniform vec2 resolution;
uniform float time;
uniform float gravity;

const float PI = 3.14159265;

vec3 diskNormal = vec3(0.0, 1.0, 0.0);
float diskInnerRadius = 4.0 * gravity;
float diskOuterRadius = 10.0 * gravity;
float diskMidRadius = 0.5 * (diskInnerRadius + diskOuterRadius);
float diskHalfWidth = 0.5 * (diskOuterRadius - diskInnerRadius);
float diskThickness = 0.15 * gravity;

vec3 target = vec3(0, 0, 0);
float radius = 2.0;
float epsilon = 0.05;

vec3 rotateY(vec3 p, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return vec3(
    c * p.x - s * p.z,
    p.y,
    s * p.x + c * p.z
  );
}

float hash(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float noise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);

  return mix(
    mix(
      mix(hash(i), hash(i + vec3(1, 0, 0)), f.x),
      mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x),
      f.y
    ),
    mix(
      mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x),
      mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x),
      f.y
    ),
    f.z
  );
}

float getDiskEmission(vec3 pos) {
  vec3 offset = pos - target;
  float height = abs(dot(offset, diskNormal));
  if (height > diskThickness) return 0.0;

  float r = length(offset.xz);
  if (r < diskInnerRadius || r > diskOuterRadius) return 0.0;

  vec3 spunPos = rotateY(offset, time * 0.5);
  float n = noise(spunPos * 8.0);
  float flicker = 0.25 + 0.75 * sin(3.0 * n);
  float radialFalloff = smoothstep(diskOuterRadius, diskInnerRadius, r);
  return flicker * radialFalloff;
}

float sdfAccretionDisk(vec3 p) {
  vec3 spun = rotateY(p - target, time * 0.5);
  float n = noise(spun * 4.0 + vec3(0.0, time * 0.1, 0.0));
  float localThickness = diskThickness + n * 2.0;

  float r = length(spun.xz);
  vec2 radial = vec2(r - diskMidRadius, spun.y);
  vec2 halfSize = vec2(diskHalfWidth, localThickness);
  vec2 d = abs(radial) - halfSize;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

vec3 getRayDirection(vec2 uv) {
  vec2 screen = uv * 2.0 - 1.0;
  screen.x *= aspect;
  vec3 ray = normalize(vec3(screen * tan(fov * 0.5), -1.0));
  return normalize((cameraMatrix * vec4(ray, 0.0)).xyz);
}

float getImpactParameter(vec3 origin, vec3 dir, vec3 center) {
  vec3 rel = origin - center;
  return length(cross(rel, dir));
}

float getDeflectionAngle(float b, float step) {
  return clamp(0.25 * gravity / (b + 0.001) * step, 0.0, radians(45.0));
}

vec3 applyAnalyticGravity(vec3 pos, vec3 dir, float step) {
  float b = getImpactParameter(pos, dir, target);
  float angle = getDeflectionAngle(b, step);
  vec3 toCenter = normalize(target - pos);
  return normalize(mix(dir, toCenter, angle / radians(45.0)));
}

vec3 rayMarch(vec3 position, vec3 dir) {
  vec3 color = vec3(0.0);
  float t = 0.0;

  for (int i = 0; i < 300; i++) {
    float dToTarget = distance(position, target);
    if (dToTarget < radius + epsilon) return vec3(0.0);

    float dDisk = max(sdfAccretionDisk(position), 0.085);
    float step = min(min(dToTarget, dDisk), 1.0);

    dir = applyAnalyticGravity(position, dir, step);
    position += dir * step;

    float emission = getDiskEmission(position);
    color += vec3(1.0, 0.7, 0.4) * emission * 0.1;

    t += step;
    if (t > 100.0) break;
  }

  vec3 cell = floor(dir * 400.0);
  float h = hash(cell); 
  float twinkle = sin(h * 10000.0 + time * 10.0);
  float brightness = smoothstep(0.995, 1.0, h) * (0.7 + 0.3 * twinkle);
  vec3 starColor = 0.5 + 0.5 * dir + brightness;

  return color + starColor;
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  vec3 rayDir = getRayDirection(uv);
  vec3 col = rayMarch(eye, rayDir);
  gl_FragColor = vec4(col, 1.0);
}
`;

export default shader;