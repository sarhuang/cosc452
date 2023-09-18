#version 300 es // These is an OpenGL ES 3.0 Shader!

precision mediump float;

in vec2 outTexCoord;
in vec4 vColor;

uniform sampler2D uSampler;

out vec4 fragColor;

void main() {
  vec4 textureColor = texture(uSampler, outTexCoord);
  if(textureColor.a < 0.1){
    discard;
  }
  fragColor = vColor * textureColor;
}
