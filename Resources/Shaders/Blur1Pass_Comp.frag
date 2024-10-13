#version 450
layout(location=0) in vec2 fUV;
#ifdef USE_OPENGL
layout(binding=0) uniform sampler2D texImage;
#else
layout(binding=0) uniform texture2D texImage;layout(binding=1) uniform sampler texSampler;
#endif
layout(location=0) out vec4 outColor;vec3 t(vec2 t){vec4 o=vec4(0);
#ifdef USE_OPENGL
o.xyz=texture(texImage,t).xyz;
#else
o.xyz=texture(sampler2D(texImage,texSampler),t).xyz;
#endif
return o.xyz;}void main(){vec3 o=vec3(0);vec2 s=fUV;
#ifdef USE_OPENGL
vec2 U=1./textureSize(texImage,0);
#else
vec2 g=1./textureSize(sampler2D(texImage,texSampler),0);
#endif
float u[5]=float[](.227027,.316216,.07027,.002216,.000167);vec2 r=vec2(frag_ubo.IsXBlur==1?1.:0.,frag_ubo.IsXBlur==1?0.:1.);for(int v=-4;v<=4;v++)o+=t(s+g*v*r)*u[abs(v)];outColor=vec4(o,1);}