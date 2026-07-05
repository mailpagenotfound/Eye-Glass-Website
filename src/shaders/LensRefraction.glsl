varying vec2 vUv;
varying vec3 vLocalPosition;
varying vec3 vLocalNormal;
varying vec3 vViewPosition;

void main() {
  vUv = uv;
  vLocalNormal = normalize(normal);
  vLocalPosition = position;
  
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vViewPosition = -mvPosition.xyz;
  
  gl_Position = projectionMatrix * mvPosition;
}
