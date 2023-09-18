#version 300 es // This is an OpenGL ES 3.0 Shader!

precision mediump float;

in vec3 aVertexPosition;
in vec2 aVertexTexCoord;
in vec3 aVertexNormal;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec3 uCameraPosition;
uniform mat4 uNormalMatrix;

out vec2 outTexCoord;
out vec3 ts_light_pos; // Tangent space values
out vec3 ts_view_pos;  //
out vec3 ts_frag_pos;  //

void main() {
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
  outTexCoord = aVertexTexCoord;

  vec3 normal = normalize(aVertexNormal);
  vec3 outTangent = normalize(cross(normal, vec3(1.0, 1.0, 1.0)));
  vec3 outBitangent = normalize(cross(normal, outTangent));

  ts_frag_pos = vec3(uModelViewMatrix * vec4(aVertexPosition, 1.0));
  vec3 t = normalize(mat3(uNormalMatrix) * outTangent);
  vec3 b = normalize(mat3(uNormalMatrix) * outBitangent);
  vec3 n = normalize(mat3(uNormalMatrix) * cross(outTangent, outBitangent));
  mat3 tbn = transpose(mat3(t, b, n));

  ts_light_pos = tbn * uCameraPosition;
  ts_view_pos = tbn * normalize(aVertexPosition - uCameraPosition);
  ts_frag_pos = tbn * ts_frag_pos;
}

