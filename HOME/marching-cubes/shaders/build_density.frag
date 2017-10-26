#version 330


// It returns computed density of each vertex 
in vec4 position;

uniform sampler3D noiseVol0;
uniform sampler3D noiseVol1;
uniform sampler3D noiseVol2;
uniform sampler3D noiseVol3;


float smoothy(float t) { return t * t * (3 - 2 * t); }
vec2  smoothy(vec2  t) { return t * t * (3 - 2 * t); }
vec3  smoothy(vec3  t) { return t * t * (3 - 2 * t); }
vec4  smoothy(vec4  t) { return t * t * (3 - 2 * t); }


/** Create 4 different octaves of noise function */
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

/** Return a density function to create a Cylinder */
float density_cylinder(vec3 ws)
{
    return 1. - length(ws); //CYLINDER
}

/** Return a density function to create a Torus */
float density_torus(vec3 ws, vec2 t)
{
    vec2 q = vec2(length(ws.xz)-t.x,ws.y); // TORUS
    float f = length(q)-0.5*t.y;
    vec3 a; vec3 b; float r;
    r=1.0;
    a = vec3(1.0,0.0,0.5);
    b = vec3(-0.5,1.0,0.5);
    vec3 pa = ws - a, ba = b - a;
    float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
    return length( pa - ba*h ) - r;
}

/** Return a density function to create a self-shaped rock  */
float density_perso(vec3 ws)
{
    //ws coordinates UV of fragments
     float f = 0; // density function
     
    //Add noise to fragments so the result isn't flat but irregular
     ws.yz   += 0.5*Noise_MQ_unsigned(ws/10,noiseVol0).xy 
	    + 0.5*Noise_MQ_unsigned(ws/10,noiseVol1).xy
	    + 0.5*Noise_MQ_unsigned(ws/10,noiseVol2).xy
	    + 0.3*Noise_MQ_unsigned(ws/10,noiseVol3).xy;
    
    //Create 4 pillar center in a xy plane (NB : xy OGL = xz in most of the case)
    vec2 pillar[4];
    
    pillar[0] = vec2(0.4,-0.8);
    pillar[1] = vec2(0.4,1.0);
    pillar[2] = vec2(-0.8,-0.4);
    pillar[3] = vec2(-0.4,1.0);

    
    
    for(int k=0; k<4; k++)
    {
      f += 1 / length(ws.xy - pillar[k].xy) -1; // add positive value at pillar
    }
    f -= 1 / length(ws.xy) - 3; //Add negative values going down the center (water flow channel)
    f = f - 2*pow(length(ws.xy), 3); // Add strong negative values at outer edge (Help to keep solid rock in bounds)
    
    //Rotate the values as the slice's Z coord changes. 
    vec2 v = vec2(cos(ws.z),3*sin(ws.z));
    f += dot(v,ws.xy);
    
    //Shelves : periodically add positive values based on slice's Z coord. 
    f += 5*cos(ws.z);
    
    return f;
}
    
float density(vec3 ws)
{ 
    float f =0;
    float f_cylinder = density_cylinder(ws);
    float f_torus = density_torus(ws,vec2(0.5,0.5));
    float f_perso = density_perso(ws);
    
    f = f_perso;
    
    return f;   
}

uniform vec3 offset;

out vec4 color;

void main(void)
{
  vec3 ws = position.xyz * 3.0 / 2.0 + offset;
  color.r = density(ws);
}
