#version 450
layout(location=0) in vec2 fUV;
layout(binding=0) uniform sampler2D texImage;layout(binding=2) uniform sampler2D depthImage;layout(binding=4) uniform sampler2D brigtnessImage;
layout(binding = 6) uniform FragUniformBuffer{mat4 model;mat4 view;mat4 proj;mat4 lightVPMat;vec4 lightPos;float exposure;float decay;float density;float weight;float numSamples;float fPad0;float fPad1;float fPad2;} frag_ubo;
layout(location=0) out vec4 outColor;vec3 t(vec2 u){vec4 o=vec4(0);
o.xyz=texture(brigtnessImage,u).xyz;
return o.xyz;}vec3 u(vec2 u){vec4 o=vec4(0);
o.xyz=texture(texImage,u).xyz;
return o.xyz;}float e(vec2 u){float g=1.;
g=texture(depthImage,u).x;
return g;}void main(){vec2 g=fUV,b=g;vec4 o=frag_ubo.proj*frag_ubo.view*vec4(frag_ubo.lightPos.xyz,1);vec2 z=(g*2.-1.-(o.xyz/o.w).xy)*(1./frag_ubo.numSamples*frag_ubo.density);vec3 v=u(b);float f=1.,n=e(g);for(float g=0.;g<frag_ubo.numSamples;g++){b-=z;vec3 u=t(b);u*=f*frag_ubo.weight;f*=frag_ubo.decay;v+=u;}v*=frag_ubo.exposure;outColor=vec4(v,1);}