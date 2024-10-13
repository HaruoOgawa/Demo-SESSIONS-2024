#version 450
layout(location=0) in vec2 fUV;
#ifdef USE_OPENGL
layout(binding=0) uniform sampler2D texImage;
#else
layout(binding=0) uniform texture2D texImage;layout(binding=1) uniform sampler texSampler;
#endif
layout(location=0) out vec4 outColor;vec3 t(vec2 t){vec4 U=vec4(0);
#ifdef USE_OPENGL
U.xyz=texture(texImage,t).xyz;
#else
U.xyz=texture(sampler2D(texImage,texSampler),t).xyz;
#endif
return U.xyz;}void main(){vec3 U=vec3(0);vec2 s=fUV;
#ifdef USE_OPENGL
vec2 g=1./textureSize(texImage,0);
#else
vec2 u=1./textureSize(sampler2D(texImage,texSampler),0);
#endif
U+=t(s+u*vec2(-.5));U+=t(s+u*vec2(-.5));U+=t(s+u*vec2(-.5));U+=t(s+u*vec2(-.5));U*=.25;outColor=vec4(U,1);}