#version 450
layout(location=0) in vec2 fUV;layout(binding=0) uniform sampler2D texImage;layout(location=0) out vec4 outColor;vec3 t(vec2 o){vec4 v=vec4(0);v.xyz=texture(texImage,o).xyz;return v.xyz;}void main(){vec3 v=vec3(0);vec2 o=fUV,n=1./textureSize(texImage,0);v=(v+t(o+n*vec2(-.5))+t(o+n*vec2(-.5))+t(o+n*vec2(-.5))+t(o+n*vec2(-.5)))*.25;outColor=vec4(v,1);}