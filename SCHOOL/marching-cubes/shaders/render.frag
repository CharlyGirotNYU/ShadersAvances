#version 330

in vec4  vf_position;
in vec4  vf_rawpos;
in vec4  vf_pos;
in vec3  vf_normal;
in float vf_occlusion;

uniform sampler3D dataFieldTex;
uniform sampler2D myTexture;
uniform sampler3D noise;

out vec4 color;

vec4 Noise_LQ_unsigned(vec3 uvw, sampler3D noiseTex)
{
  return texture(noiseTex, uvw);
}

vec4 Noise_LQ_signed(vec3 uvw, sampler3D noiseTex)
{
  return Noise_LQ_unsigned(uvw, noiseTex) * 2.0 - 1.0;
}
void main(void)
{
  vec2 coord_tex;
  vec3 test_color;
  if(vf_normal.x > vf_normal.y && vf_normal.x > vf_normal.z)
  {
    coord_tex = vf_position.yz;
    test_color = vec3(vf_normal.x,0.0,.0);
  }
  else if(vf_normal.y > vf_normal.x && vf_normal.y > vf_normal.z)
  {
    coord_tex = vf_position.xz;
    test_color = vec3(.0,vf_normal.y,.0);
  }
  else
  {
    coord_tex = vf_position.xy;
    test_color = vec3(.0,.0,vf_normal.z);
  }
  test_color = 5*vec3(vf_normal.x, vf_normal.y, vf_normal.z);
  vec4 texcolor = texture(myTexture, coord_tex);
  //vec4 texcolor = vec4(test_color,1);
  float specular;
  vec3 s = vec3(0.0, 0.0, -1.0);

  vec3 light = -s.xyz;
  vec3 n = vf_normal;
  vec3 r = reflect(light, n);
  r = normalize(r);
  vec3 v = -vf_pos.xyz;
  v = normalize(v);

  vec4 blended_color;
//   blended_color = vec4(1.,0.,0.,1.);
blended_color = vec4(1.0,1.0,1.0,1.0);

  vec4 diffuse  = blended_color * max(0.0, dot(n, s.xyz)) * 0.8;
  specular = pow(max(0.0, dot(r, v)), 10.0);
  specular = clamp(specular, 0.0, 1.0);

  float occ_light = clamp(2.0 - 2.0 * vf_occlusion, 0.0, 1.0);
  color = /*occ_light * occ_light * */texcolor*(blended_color * 0.2 + 0.6 * diffuse + 0.3 * vec4(vec3(specular), 1.0));
}
