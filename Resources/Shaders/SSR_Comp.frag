#version 450
layout(location=0) in vec2 fUV;
#ifdef USE_OPENGL
layout(binding=0) uniform sampler2D texImage;layout(binding=2) uniform sampler2D depthImage;layout(binding=4) uniform sampler2D posImage;layout(binding=6) uniform sampler2D normalImage;layout(binding=8) uniform sampler2D metallicRoughnessImage;
#else
layout(binding=0) uniform texture2D texImage;layout(binding=1) uniform sampler texSampler;layout(binding=2) uniform texture2D depthImage;layout(binding=3) uniform sampler depthSampler;layout(binding=4) uniform texture2D posImage;layout(binding=5) uniform sampler posSampler;layout(binding=6) uniform texture2D normalImage;layout(binding=7) uniform sampler normalSampler;layout(binding=8) uniform texture2D metallicRoughnessImage;layout(binding=9) uniform sampler metallicRoughnessSampler;
#endif
layout(location=0) out vec4 outColor;vec3 t(vec2 u){vec4 g=vec4(0);
#ifdef USE_OPENGL
g.xyz=texture(texImage,u).xyz;
#else
g.xyz=texture(sampler2D(texImage,texSampler),u).xyz;
#endif
return g.xyz;}vec3 u(vec2 u){vec4 g=vec4(0);
#ifdef USE_OPENGL
g.xyz=texture(posImage,u).xyz;
#else
g.xyz=texture(sampler2D(posImage,posSampler),u).xyz;
#endif
return g.xyz;}vec3 s(vec2 u){vec4 g=vec4(0);
#ifdef USE_OPENGL
g.xyz=texture(normalImage,u).xyz;
#else
g.xyz=texture(sampler2D(normalImage,normalSampler),u).xyz;
#endif
return g.xyz;}vec2 e(vec2 u){
#ifdef USE_OPENGL
vec4 g=texture(metallicRoughnessImage,u);
#else
vec4 s=texture(sampler2D(metallicRoughnessImage,metallicRoughnessSampler),u);
#endif
return s.zw;}void main(){vec3 g=vec3(0);vec2 v=fUV;g=t(v);vec3 b=u(v),z=s(v);v=e(v);float n=v.x;vec3 l=frag_ubo.cameraPos.xyz;z=reflect(normalize(b-l),z)*(10./24.);bool m=false;l=vec3(0);if(n>0.){for(float g=0.;g<24.;g++){b+=z;vec4 s=frag_ubo.proj*frag_ubo.view*vec4(b,1);vec2 v=s.xy/s.w*.5+.5;vec3 n=u(v);if(length(n-b)<.5){l=t(v);m=true;break;}}g+=l*n;}outColor=vec4(g,1);}