#version 450
layout(location=0) in vec2 fUV;
#ifdef USE_OPENGL
layout(binding=0) uniform sampler2D texImage;layout(binding=2) uniform sampler2D bloomImage;
#else
layout(binding=0) uniform texture2D texImage;layout(binding=1) uniform sampler texSampler;layout(binding=2) uniform texture2D bloomImage;layout(binding=3) uniform sampler bloomSampler;
#endif
layout(location=0) out vec4 outColor;void main(){vec3 b=vec3(0);vec2 g=fUV;
#ifdef USE_OPENGL
vec3 u=texture(texImage,g).xyz;
#else
vec3 t=texture(sampler2D(texImage,texSampler),g).xyz;
#endif

#ifdef USE_OPENGL
vec3 s=texture(bloomImage,g).xyz;
#else
vec3 e=texture(sampler2D(bloomImage,bloomSampler),g).xyz;
#endif
b=t+e;outColor=vec4(b,1);}