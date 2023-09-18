#version 300 es

in vec3 aVertexPosition;
in vec3 aVertexNormal;
in vec2 aVertexTexCoord;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uNormalMatrix;
uniform vec3 uCameraPosition;

out vec3 vNormal;
out vec3 vViewDirection;
out vec2 outTexCoord;


void main() {
    gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
    vNormal = normalize(vec3(uNormalMatrix * vec4(aVertexNormal, 0.0)));
	vViewDirection = normalize(aVertexPosition - uCameraPosition);
	outTexCoord = aVertexTexCoord;
}
