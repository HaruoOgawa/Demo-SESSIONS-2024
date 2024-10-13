#version 450
layout(location=0) in vec2 fUV;
layout(binding=0) uniform sampler2D texImage;
layout(binding = 2) uniform FragUniformBuffer{mat4 mPad0;mat4 mPad1;mat4 mPad2;mat4 mPad3;float Threshold;float Intencity;float fPad0;float fPad1;} frag_ubo;
layout(location=0) out vec4 outBrigtnessColor;layout(location=1) out vec4 outColor;void main(){vec4 o=vec4(1);vec2 t=fUV;o.xyz=texture(texImage,t).xyz;vec4 v=o;v.xyz=max(vec3(0),v.xyz-frag_ubo.Threshold)*frag_ubo.Intencity;outColor=o;outBrigtnessColor=v;}