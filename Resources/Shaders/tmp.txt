#version 450
layout(location=0) in vec2 fUV;layout(binding=0) uniform sampler2D texImage;layout(location=0) out vec4 outColor;void main(){vec4 v=vec4(1);v.xyz=texture(texImage,fUV).xyz;outColor=v;}