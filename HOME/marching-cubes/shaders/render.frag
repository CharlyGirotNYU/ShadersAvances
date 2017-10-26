#version 330

in vec4  vf_position;
in vec4  vf_rawpos;
in vec4  vf_pos;
in vec3  vf_normal;
in float vf_occlusion;

uniform sampler3D dataFieldTex; // Je comprend pas a quoi il sert celui la
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
  //Adaptation des couleurs selon les normales pondérés
  
  vec2 coord_tex;
  vec3 test_color;
  if(vf_normal.x > vf_normal.y && vf_normal.x > vf_normal.z)
  {
    coord_tex = vf_position.yz;
// //     test_color = vec3(vf_normal.x,0.0,.0);
    // test_color = vec3(vf_normal.x, 0., 0.);
  }
  else if(vf_normal.y > vf_normal.x && vf_normal.y > vf_normal.z)
  {
    coord_tex = vf_position.xz;
    //test_color = vec3(.0,vf_normal.y,.0);
// test_color = vec3(vf_normal.x, 3*vf_normal.y, vf_normal.z);
  }
  else
  {
    coord_tex = vf_position.xy;
    //test_color = vec3(.0,.0,vf_normal.z);
// test_color = vec3(vf_normal.x, vf_normal.y, 3*vf_normal.z);
  }
// 
  test_color = 5*vec3(vf_normal.x, vf_normal.y, vf_normal.z);
  
  
  
  float blend_weights = abs(100)-0.2;
  blend_weights *=7;
  blend_weights = pow(blend_weights, 3);
  blend_weights = max(0,blend_weights);
  blend_weights /= dot(blend_weights,1);
  
  const float freq = 0.17;
  vec3 noiseVal = vec3(0.5,0.5,0.5);
  //vec4 texcolor = vec4(blend_weights*test_color,1);
  vec4 texcolor = texture(blend_weights*myTexture, coord_tex);
/** Original */  
  float specular;
  vec3 s = vec3(1, 1, -1.0);
  vec3 s2 = vec3(-1, -1, -1.0);
  
  vec3 light = -s.xyz + s2.xyz;
  vec3 n = vf_normal;
  vec3 r = reflect(light, n);
  r = normalize(r);
  vec3 v = -vf_pos.xyz;
  v = normalize(v);

  vec4 blended_color;
//   blended_color = vec4(1.,0.,0.,1.);
//   blended_color = vec4(1.0,1.0,1.0,1.0);
blended_color = texcolor;

  vec4 diffuse  = blended_color * max(0.0, dot(n, s.xyz)) * 0.8;
  specular = pow(max(0.0, dot(r, v)), 10.0);
  specular = clamp(specular, 0.0, 1.0);

  float occ_light = clamp(2.0 - 2.0 * vf_occlusion, 0.0, 1.0);
  color =  occ_light * occ_light * (blended_color * 0.2 + 0.6 * diffuse + 0.3 * vec4(vec3(specular), 1.0));
}
