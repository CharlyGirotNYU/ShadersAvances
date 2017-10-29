#version 330
//Build density shaders are computing density of each vertex 
in vec2 v_position;

out float layer;

void main(void)
{
  gl_Position = vec4(v_position, 0.0, 1.0);
  layer = gl_InstanceID;
}
