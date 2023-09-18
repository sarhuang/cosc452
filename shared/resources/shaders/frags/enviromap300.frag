#version 300 es

precision mediump float;

in vec3 vNormal;
in vec3 vViewDirection;

out vec4 fragColor;

uniform samplerCube uSampler;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDirection = normalize(vViewDirection);
  
  fragColor = texture(uSampler, reflect(-viewDirection, normal));
}
