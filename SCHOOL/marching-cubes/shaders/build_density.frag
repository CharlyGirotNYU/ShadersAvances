#version 330

in vec4 position;

uniform sampler3D noiseVol0;
uniform sampler3D noiseVol1;
uniform sampler3D noiseVol2;
uniform sampler3D noiseVol3;


float smoothy(float t) { return t * t * (3 - 2 * t); }
vec2  smoothy(vec2  t) { return t * t * (3 - 2 * t); }
vec3  smoothy(vec3  t) { return t * t * (3 - 2 * t); }
vec4  smoothy(vec4  t) { return t * t * (3 - 2 * t); }

vec4 Noise_LQ_unsigned(vec3 uvw, sampler3D noiseTex)
{
  return texture(noiseTex, uvw);
}

vec4 Noise_LQ_signed(vec3 uvw, sampler3D noiseTex)
{
  return Noise_LQ_unsigned(uvw, noiseTex) * 2 - 1;
}

#define NOISE_LATTICE_SIZE 16

vec4 Noise_MQ_unsigned(vec3 uvw, sampler3D noiseTex)
{
  vec3 t = fract(uvw * NOISE_LATTICE_SIZE);
  vec3 t2 = (3 - 2 * t) * t * t;
  vec3 uvw2 = uvw + (t2 - t) /  NOISE_LATTICE_SIZE;
  return Noise_LQ_unsigned(uvw2, noiseTex);
}

vec4 Noise_MQ_signed(vec3 uvw, sampler3D noiseTex)
{
  vec3 t = fract(uvw * NOISE_LATTICE_SIZE);
  vec3 t2 = (3 - 2 * t) * t * t;
  vec3 uvw2 = uvw + (t2 - t) / NOISE_LATTICE_SIZE;
  return Noise_LQ_signed(uvw2, noiseTex);
}

float density(vec3 ws)
{ // C'est cette fonction qui définit la "forme"

  // return 1. - length(ws); //CYLINDER
//   vec2 q = vec2(length(ws.xz)-t.x,ws.y); // TORUS
//   return length(q)-0.5*t.y;
//     vec3 a; vec3 b; float r;
//     r=1.0;
//     a = vec3(1.0,0.0,0.5);
//     b = vec3(-0.5,1.0,0.5);
//      vec3 pa = ws - a, ba = b - a;
//     float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
//     return length( pa - ba*h ) - r;

    ws.yz   += 0.1*Noise_MQ_unsigned(ws/10,noiseVol0).xy 
	    + 0.3*Noise_MQ_unsigned(ws/10,noiseVol1).xy
	    + 0.2*Noise_MQ_unsigned(ws/10,noiseVol2).xy
	    + 0.3*Noise_MQ_unsigned(ws/10,noiseVol3).xy;
    vec2 pillar[4];
    
//  pillar[0] = vec2(1.0,2.0);
//  pillar[1] = vec2(1,0.5); 
//  pillar[2] = vec2(2.0,-1.0);
    pillar[0] = vec2(0.4,-0.4);
    pillar[1] = vec2(0.4,0.4);
    pillar[2] = vec2(-0.4,-0.4);
    pillar[3] = vec2(-0.4,0.4);

    float f = 0;
    
    for(int k=0; k<4; k++)
    {
      f += 1 / length(ws.xy - pillar[k].xy) - 1;
    }
    f -= 1 / length(ws.xz) -1;
    f = f - pow(length(ws.xz), 2);
    
//     vec2 v = vec2(cos(ws.z), sin(ws.z));
//     f += dot(v, ws.xy);
    f += cos(ws.z)+sin(ws.x);
    
    return f;
}

uniform vec3 offset;

out vec4 color;

void main(void)
{
  vec3 ws = position.xyz * 3.0 / 2.0 + offset;
  color.r = density(ws);
}
