#version 300 es // These is an OpenGL ES 3.0 Shader!

precision mediump float;

in vec2 outTexCoord;
uniform sampler2D uSampler;

out vec4 fragColor;

void main() {
  fragColor = texture(uSampler, outTexCoord);
}
