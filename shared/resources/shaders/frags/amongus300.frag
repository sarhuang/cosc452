#version 300 es

precision mediump float;

in vec3 vNormal;
in vec3 vViewDirection;
in vec2 outTexCoord;

out vec4 fragColor;

uniform sampler2D uSampler;

void main() {
  //Ruby
  vec4 uAmbient = vec4(0.1745, 0.01175, 0.01175, 0.55);
  vec4 uSpecular = vec4(0.727811, 0.626959, 0.626959, 0.55); 
  float uShininess = 76.8;


  vec3 normal = normalize(vNormal);
  vec3 viewDirection = normalize(vViewDirection);
  vec4 textureColor = texture(uSampler, outTexCoord);

  vec3 ambient = uAmbient.rgb * uAmbient.a;
  vec3 diffuse = textureColor.rgb * textureColor.a * max(dot(normal, viewDirection), 0.0);
  vec3 specularLight = uSpecular.rgb * uSpecular.a;
  float specularFactor = pow(max(dot(normal, viewDirection), 0.0), uShininess) * 1.5;
  vec3 specular = specularLight * specularFactor;
  
  if(textureColor.a < 0.1){
    discard;
  } 
  fragColor = vec4(ambient + diffuse + specular, 1.0) * textureColor;
}
