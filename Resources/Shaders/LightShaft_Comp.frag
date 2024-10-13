#version 450
layout(location=0) in vec2 fUV;
#ifdef USE_OPENGL
layout(binding=0) uniform sampler2D texImage;layout(binding=2) uniform sampler2D depthImage;layout(binding=4) uniform sampler2D brigtnessImage;
#else
layout(binding=0) uniform texture2D texImage;layout(binding=1) uniform sampler texSampler;layout(binding=2) uniform texture2D depthImage;layout(binding=3) uniform sampler depthSampler;layout(binding=4) uniform texture2D brigtnessImage;layout(binding=5) uniform sampler brigtnessSampler;
#endif
layout(location=0) out vec4 outColor;vec3 t(vec2 u){vec4 o=vec4(0);
#ifdef USE_OPENGL
o.xyz=texture(brigtnessImage,u).xyz;
#else
o.xyz=texture(sampler2D(brigtnessImage,brigtnessSampler),u).xyz;
#endif
return o.xyz;}vec3 u(vec2 u){vec4 o=vec4(0);
#ifdef USE_OPENGL
o.xyz=texture(texImage,u).xyz;
#else
o.xyz=texture(sampler2D(texImage,texSampler),u).xyz;
#endif
return o.xyz;}float e(vec2 u){float g=1.;
#ifdef USE_OPENGL
g=texture(depthImage,u).x;
#else
g=texture(sampler2D(depthImage,depthSampler),u).x;
#endif
return g;}void main(){vec2 g=fUV,b=g;vec4 o=frag_ubo.proj*frag_ubo.view*vec4(frag_ubo.lightPos.xyz,1);vec2 z=(g*2.-1.-(o.xyz/o.w).xy)*(1./frag_ubo.numSamples*frag_ubo.density);vec3 v=u(b);float f=1.,n=e(g);for(float g=0.;g<frag_ubo.numSamples;g++){b-=z;vec3 u=t(b);u*=f*frag_ubo.weight;f*=frag_ubo.decay;v+=u;}v*=frag_ubo.exposure;outColor=vec4(v,1);}