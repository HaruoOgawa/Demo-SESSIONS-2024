#version 450
layout(location=0) in vec3 f_WorldNormal;layout(location=1) in vec2 f_Texcoord;layout(location=2) in vec4 f_WorldPos;layout(location=3) in vec3 f_WorldTangent;layout(location=4) in vec3 f_WorldBioTangent;layout(location=5) in vec4 f_LightSpacePos;layout(location=0) out vec4 outColor;
#ifdef USE_OPENGL
layout(binding=2) uniform sampler2D baseColorTexture;layout(binding=4) uniform sampler2D metallicRoughnessTexture;layout(binding=6) uniform sampler2D emissiveTexture;layout(binding=8) uniform sampler2D normalTexture;layout(binding=10) uniform sampler2D occlusionTexture;layout(binding=12) uniform samplerCube cubemapTexture;layout(binding=14) uniform sampler2D shadowmapTexture;layout(binding=16) uniform sampler2D IBL_Diffuse_Texture;layout(binding=18) uniform sampler2D IBL_Specular_Texture;layout(binding=20) uniform sampler2D IBL_GGXLUT_Texture;layout(binding=22) uniform sampler2D cubeMap2DTexture;
#else
layout(binding=2) uniform texture2D baseColorTexture;layout(binding=3) uniform sampler baseColorTextureSampler;layout(binding=4) uniform texture2D metallicRoughnessTexture;layout(binding=5) uniform sampler metallicRoughnessTextureSampler;layout(binding=6) uniform texture2D emissiveTexture;layout(binding=7) uniform sampler emissiveTextureSampler;layout(binding=8) uniform texture2D normalTexture;layout(binding=9) uniform sampler normalTextureSampler;layout(binding=10) uniform texture2D occlusionTexture;layout(binding=11) uniform sampler occlusionTextureSampler;layout(binding=12) uniform textureCube cubemapTexture;layout(binding=13) uniform sampler cubemapTextureSampler;layout(binding=14) uniform texture2D shadowmapTexture;layout(binding=15) uniform sampler shadowmapTextureSampler;layout(binding=16) uniform texture2D IBL_Diffuse_Texture;layout(binding=17) uniform sampler IBL_Diffuse_TextureSampler;layout(binding=18) uniform texture2D IBL_Specular_Texture;layout(binding=19) uniform sampler IBL_Specular_TextureSampler;layout(binding=20) uniform texture2D IBL_GGXLUT_Texture;layout(binding=21) uniform sampler IBL_GGXLUT_TextureSampler;layout(binding=22) uniform texture2D cubeMap2DTexture;layout(binding=23) uniform sampler cubeMap2DTextureSampler;
#endif
struct PBRParam{float NdotL;float NdotV;float NdotH;float LdotH;float VdotH;float perceptualRoughness;float metallic;vec3 reflectance0;vec3 reflectance90;float alphaRoughness;vec3 diffuseColor;vec3 specularColor;};float t(PBRParam s){float u=s.alphaRoughness*s.alphaRoughness,v=(s.NdotH*u-s.NdotH)*s.NdotH+1.;return u/(acos(-1.)*v*v);}float e(PBRParam s){float u=s.NdotL,v=s.NdotV,f=s.alphaRoughness;return 2.*u/(u+sqrt(f*f+(1.-f*f)*(u*u)))*(2.*v/(v+sqrt(f*f+(1.-f*f)*(v*v))));}vec3 u(PBRParam s){return s.reflectance0+(s.reflectance90-s.reflectance0)*pow(clamp(1.-s.VdotH,0.,1.),5.);}vec3 e(){vec3 u=vec3(0);if(ubo.useNormalTexture!=0){
#ifdef USE_OPENGL
u=texture(normalTexture,f_Texcoord).xyz;
#else
u=texture(sampler2D(normalTexture,normalTextureSampler),f_Texcoord).xyz;
#endif
u=normalize((2.*u-1.)*vec3(ubo.normalMapScale,ubo.normalMapScale,1)*mat3(normalize(f_WorldTangent.xyz),normalize(f_WorldBioTangent.xyz),normalize(f_WorldNormal.xyz)));}else u=f_WorldNormal;return u;}vec4 s(vec4 s){return vec4(pow(s.xyz,vec3(2.2)),s.w);}vec4 v(vec4 s){return vec4(pow(s.xyz,vec3(1./2.2)),s.w);}vec2 D(vec2 s){vec2 u=vec2(0),v=vec2(1./ubo.ShadowMapX,1./ubo.ShadowMapY);
#ifdef USE_OPENGL
u=u+texture(shadowmapTexture,s+vec2(-1)*v).xy+texture(shadowmapTexture,s+vec2(-1,0)*v).xy+texture(shadowmapTexture,s+vec2(-1,1)*v).xy+texture(shadowmapTexture,s+vec2(0,-1)*v).xy+texture(shadowmapTexture,s+vec2(0)*v).xy+texture(shadowmapTexture,s+vec2(0,1)*v).xy+texture(shadowmapTexture,s+vec2(1,-1)*v).xy+texture(shadowmapTexture,s+vec2(1,0)*v).xy+texture(shadowmapTexture,s+vec2(1)*v).xy;
#else
u+=texture(sampler2D(shadowmapTexture,shadowmapTextureSampler),s+vec2(-1)*v).xy;u+=texture(sampler2D(shadowmapTexture,shadowmapTextureSampler),s+vec2(-1,0)*v).xy;u+=texture(sampler2D(shadowmapTexture,shadowmapTextureSampler),s+vec2(-1,1)*v).xy;u+=texture(sampler2D(shadowmapTexture,shadowmapTextureSampler),s+vec2(0,-1)*v).xy;u+=texture(sampler2D(shadowmapTexture,shadowmapTextureSampler),s+vec2(0)*v).xy;u+=texture(sampler2D(shadowmapTexture,shadowmapTextureSampler),s+vec2(0,1)*v).xy;u+=texture(sampler2D(shadowmapTexture,shadowmapTextureSampler),s+vec2(1,-1)*v).xy;u+=texture(sampler2D(shadowmapTexture,shadowmapTextureSampler),s+vec2(1,0)*v).xy;u+=texture(sampler2D(shadowmapTexture,shadowmapTextureSampler),s+vec2(1)*v).xy;
#endif
u/=9.;
#ifdef USE_OPENGL

#else

#endif
return u;}float D(vec3 s,vec3 u,vec3 v){vec2 t=D(s.xy);float f=s.z-max(.005,.05*(1.-dot(u,v)));if(f<=t.x)return 1.;float c=max(.005,t.y-t.x*t.x);f-=t.x;return c/(c+f*f);}vec2 f(vec3 s){return vec2(atan(s.z,s.x)/6.283,acos(s.y)/3.1415);}vec3 e(PBRParam s,vec3 u,vec3 c){vec3 e=vec3(0);if(ubo.useCubeMap!=0){float t=ubo.mipCount,f=t*s.perceptualRoughness;
#ifdef USE_OPENGL
e=v(textureLod(cubemapTexture,reflect(u,c),f)).xyz;
#else
e=v(textureLod(samplerCube(cubemapTexture,cubemapTextureSampler),reflect(u,c),f)).xyz;
#endif
}else if(ubo.useDirCubemap!=0){vec2 t=f(reflect(u,c));float p=ubo.mipCount,D=p*s.perceptualRoughness;
#ifdef USE_OPENGL
e=v(textureLod(cubeMap2DTexture,t,D)).xyz;
#else
e=v(textureLod(sampler2D(cubeMap2DTexture,cubeMap2DTextureSampler),t,D)).xyz;
#endif
}return e;}vec2 c(vec3 s){return vec2(atan(s.z,s.x)/6.283,acos(s.y)/3.1415);}vec3 c(PBRParam u,vec3 e,vec3 v){float t=ubo.mipCount,f=t*u.perceptualRoughness;
#ifdef USE_OPENGL
vec3 p=s(texture(IBL_GGXLUT_Texture,vec2(u.NdotV,1.-u.perceptualRoughness))).xyz,D=s(texture(IBL_Diffuse_Texture,c(v))).xyz,r=s(textureLod(IBL_Specular_Texture,c(reflect(e,v)),f)).xyz;
#else
vec3 o=s(texture(sampler2D(IBL_GGXLUT_Texture,IBL_GGXLUT_TextureSampler),vec2(u.NdotV,1.-u.perceptualRoughness))).xyz,a=s(texture(sampler2D(IBL_Diffuse_Texture,IBL_Diffuse_TextureSampler),c(v))).xyz,x=s(textureLod(sampler2D(IBL_Specular_Texture,IBL_Specular_TextureSampler),c(reflect(e,v)),f)).xyz;
#endif
return a*u.diffuseColor+x*(u.specularColor*o.x+o.y);}float p(vec3 s){vec4 u=ubo.proj*ubo.view*vec4(s,1);float v=u.z/u.w*.5+.5,f=v*v,t=dFdx(v);v=dFdy(v);return f+.25*(t*t+v*v);}void main(){vec4 v=vec4(1);float f=ubo.roughnessFactor,l=ubo.metallicFactor;if(ubo.useMetallicRoughnessTexture!=0){
#ifdef USE_OPENGL
vec4 u=texture(metallicRoughnessTexture,f_Texcoord);
#else
vec4 s=texture(sampler2D(metallicRoughnessTexture,metallicRoughnessTextureSampler),f_Texcoord);
#endif
f*=s.y;l*=s.z;}f=clamp(f,.04,1.);l=clamp(l,0.,1.);float i=f*f;vec4 o;if(ubo.useBaseColorTexture!=0){
#ifdef USE_OPENGL
o=texture(baseColorTexture,f_Texcoord);
#else
o=texture(sampler2D(baseColorTexture,baseColorTextureSampler),f_Texcoord);
#endif
}else o=ubo.baseColorFactor;vec3 r=vec3(.04),y=o.xyz*(vec3(1)-r)*(1.-l);r=mix(r,o.xyz,l);vec3 b=e(),g=-1.f*normalize(f_WorldPos.xyz-ubo.cameraPos.xyz),d=-1.f*normalize(ubo.lightDir.xyz),z=normalize(g+d);float n=clamp(dot(b,d),0.,1.),x=clamp(abs(dot(b,g)),0.,1.);PBRParam m=PBRParam(n,x,clamp(dot(b,z),0.,1.),clamp(dot(d,z),0.,1.),clamp(dot(g,z),0.,1.),f,l,r.xyz,vec3(1)*clamp(max(max(r.x,r.y),r.z)*25.,0.,1.),i,y,r);z=vec3(0);r=vec3(0);i=t(m);f=e(m);y=u(m);if(n>0.||x>0.)z=max(z+i*f*y/(4.*n*x),vec3(0)),r+=(1.-y)*(m.diffuseColor/acos(-1.)),v.xyz=n*(z+r);if(ubo.useIBL!=0)v.xyz+=c(m,g,b);else{v.xyz+=e(m,g,b)*y;vec3 u=clamp(z,.04,1.);v.xyz+=u*r;}if(ubo.useOcclusionTexture!=0){
#ifdef USE_OPENGL
float u=texture(occlusionTexture,f_Texcoord).x;
#else
float e=texture(sampler2D(occlusionTexture,occlusionTextureSampler),f_Texcoord).x;
#endif
v.xyz=mix(v.xyz,v.xyz*e,ubo.occlusionStrength);}if(ubo.useEmissiveTexture!=0){
#ifdef USE_OPENGL
vec3 u=s(texture(emissiveTexture,f_Texcoord)).xyz*ubo.emissiveFactor.xyz;
#else
vec3 t=s(texture(sampler2D(emissiveTexture,emissiveTextureSampler),f_Texcoord)).xyz*ubo.emissiveFactor.xyz;
#endif
v.xyz+=t;}if(ubo.useShadowMap!=0){float u=D(f_LightSpacePos.xyz/f_LightSpacePos.w*.5+.5,b,d);v.xyz*=u;}v.xyz=pow(v.xyz,vec3(1./2.2));v.w=o.w;outColor=v;gl_FragDepth=p(f_WorldPos.xyz);}