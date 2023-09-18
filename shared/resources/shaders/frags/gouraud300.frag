#version 300 es // These is an OpenGL ES 3.0 Shader!

precision mediump float;

in vec4 vColor;
out vec4 fragColor;

void main() {
	fragColor = vColor;
}
