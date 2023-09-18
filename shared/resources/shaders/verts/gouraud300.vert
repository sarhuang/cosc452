#version 300 es // These is an OpenGL ES 3.0 Shader!

in vec3 aVertexPosition;
in vec3 aVertexNormal;

out vec4 vColor;

uniform vec3 uCameraPosition;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec4 uAmbient;
uniform vec4 uDiffuse;
uniform vec4 uSpecular;
uniform float uShininess;


void main() {
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
  vec3 transformedNormal = vec3(mat3(uModelViewMatrix) * aVertexNormal);
  vec3 viewDirection = normalize(aVertexPosition - uCameraPosition);

  vec3 ambient = uAmbient.rgb * uAmbient.a;
  vec3 diffuse = uDiffuse.rgb * uDiffuse.a * max(dot(transformedNormal, viewDirection), 0.0);
  vec3 specularLight = uSpecular.rgb * uSpecular.a;
  float specularFactor = pow(max(dot(viewDirection, transformedNormal), 0.0), uShininess);
  vec3 specular = specularLight * specularFactor;
  vColor = vec4(ambient + diffuse + specular, 1.0);
}

