#version 300 es // This is an OpenGL ES 3.0 Shader!

precision mediump float;

in vec2 outTexCoord;
in vec3 ts_light_pos;
in vec3 ts_view_pos;
in vec3 ts_frag_pos;
out vec4 fragColor;

uniform sampler2D uSampler;
uniform sampler2D uSamplerNormal;


void main() {
  vec3 light_dir = normalize(ts_light_pos - ts_frag_pos);
  vec3 view_dir = normalize(ts_view_pos - ts_frag_pos);

  vec4 diffuseTexture = texture(uSampler, outTexCoord);
  vec4 normalTexture = texture(uSamplerNormal, outTexCoord);

  //Normal mapping
  vec3 normal = normalize(normalTexture.rgb * 2.0 - 1.0);
  vec3 ambient = 0.3 * diffuseTexture.rgb;
  float diffuse = max(dot(normal, light_dir), 0.0);

  fragColor = vec4(ambient + diffuse * diffuseTexture.rgb, 1.0);
}
