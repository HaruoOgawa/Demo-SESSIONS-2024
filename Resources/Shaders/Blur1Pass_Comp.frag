#version 450
layout(location=0) in vec2 fUV;
layout(binding=0) uniform sampler2D texImage;
layout(binding = 2) uniform FragUniformBuffer{mat4 mPad0;mat4 mPad1;mat4 mPad2;mat4 mPad3;int IsXBlur;int iPad0;int iPad1;int iPad2;}frag_ubo;
layout(location=0) out vec4 outColor;vec3 t(vec2 t){vec4 o=vec4(0);
o.xyz=texture(texImage,t).xyz;
return o.xyz;}void main(){vec3 o=vec3(0);vec2 s=fUV;
vec2 g=1./textureSize(texImage,0);
float u[5]=float[](.227027,.316216,.07027,.002216,.000167);vec2 r=vec2(frag_ubo.IsXBlur==1?1.:0.,frag_ubo.IsXBlur==1?0.:1.);for(int v=-4;v<=4;v++)o+=t(s+g*v*r)*u[abs(v)];outColor=vec4(o,1);}