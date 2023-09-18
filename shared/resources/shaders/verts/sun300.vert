#version 300 es // These is an OpenGL ES 3.0 Shader!

precision mediump float;

in vec3 aVertexPosition;
in vec3 aVertexNormal;
in vec2 aVertexTexCoord;

out vec2 outTexCoord;
out vec4 vColor;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec3 uCameraPosition;
uniform sampler2D uSampler;

void main() {
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
  vec3 transformedNormal = vec3(mat3(uModelViewMatrix) * aVertexNormal);
  vec3 viewDirection = normalize(aVertexPosition - uCameraPosition);

  vec4 uAmbient = vec4(0.329412, 0.223529, 0.027451, 1.0);
  vec4 uSpecular = vec4(0.992157, 0.941176, 0.807843, 1.0);
  float uShininess = 29.8974;

  vec3 ambient = uAmbient.rgb * uAmbient.a;
  vec3 diffuse = texture(uSampler, aVertexTexCoord).rgb * texture(uSampler, aVertexTexCoord).a * max(dot(transformedNormal, viewDirection), 0.0);
  vec3 specularLight = uSpecular.rgb * uSpecular.a;
  float specularFactor = pow(max(dot(viewDirection, transformedNormal), 0.0), uShininess) * 1.5;
  vec3 specular = specularLight * specularFactor;

  vColor = vec4(ambient + diffuse + specular, 1.0);
  outTexCoord = aVertexTexCoord;
}
