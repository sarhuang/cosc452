#version 300 es

precision mediump float;

in vec3 vNormal;
in vec3 vViewDirection;
in vec4 glYPosition;

out vec4 fragColor;

uniform vec4 uAmbient;
uniform vec4 uDiffuse;
uniform vec4 uSpecular;
uniform float uShininess;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDirection = normalize(vViewDirection);
  
  vec3 ambient = uAmbient.rgb * uAmbient.a;
  vec3 diffuse = uDiffuse.rgb * uDiffuse.a * max(dot(normal, viewDirection), 0.0);
  vec3 specularLight = uSpecular.rgb * uSpecular.a;
  float specularFactor = pow(max(dot(normal, viewDirection), 0.0), uShininess);
  vec3 specular = specularLight * specularFactor;

  float red = (glYPosition.y + 1.0) / 2.0;
  vec4 color = vec4(ambient + diffuse + specular, 1.0);
  color.r *= red;
  fragColor = color;
}
