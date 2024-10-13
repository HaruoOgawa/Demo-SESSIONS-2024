#version 450
layout(location=0) in vec2 fUV;
#ifdef USE_OPENGL
layout(binding=0) uniform sampler2D texImage;
#else
layout(binding=0) uniform texture2D texImage;layout(binding=1) uniform sampler texSampler;
#endif
layout(location=0) out vec4 outBrigtnessColor;layout(location=1) out vec4 outColor;void main(){vec4 o=vec4(1);vec2 t=fUV;
#ifdef USE_OPENGL
o.xyz=texture(texImage,t).xyz;
#else
o.xyz=texture(sampler2D(texImage,texSampler),t).xyz;
#endif
vec4 v=o;v.xyz=max(vec3(0),v.xyz-frag_ubo.Threshold)*frag_ubo.Intencity;outColor=o;outBrigtnessColor=v;}