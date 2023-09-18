#version 300 es // These is an OpenGL ES 3.0 Shader!

precision mediump float;

in vec3 aVertexPosition;
in vec2 aVertexTexCoord;

out vec2 outTexCoord;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

void main() {
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
  outTexCoord = aVertexTexCoord;
}
