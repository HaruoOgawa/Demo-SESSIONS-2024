#version 450
layout(location=0) in vec2 fUV;
#ifdef USE_OPENGL
layout(binding=0) uniform sampler2D texImage;
#else
layout(binding=0) uniform texture2D texImage;layout(binding=1) uniform sampler texSampler;
#endif
layout(location=0) out vec4 outColor;void main(){vec4 t=vec4(1);vec2 g=fUV;
#ifdef USE_OPENGL
t.xyz=texture(texImage,g).xyz;
#else
t.xyz=texture(sampler2D(texImage,texSampler),g).xyz;
#endif
outColor=t;}