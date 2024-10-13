#version 450
layout(location=0) in vec2 fUV;
#ifdef USE_OPENGL
layout(binding=1) uniform sampler2D texGPosition;layout(binding=3) uniform sampler2D texGNormal;layout(binding=5) uniform sampler2D texGAlbedo;layout(binding=7) uniform sampler2D texDepth;layout(binding=9) uniform sampler2D texParam1;
#else
layout(binding=1) uniform texture2D texGPosition;layout(binding=2) uniform sampler texGPositionSampler;layout(binding=3) uniform texture2D texGNormal;layout(binding=4) uniform sampler texGNormalSampler;layout(binding=5) uniform texture2D texGAlbedo;layout(binding=6) uniform sampler texGAlbedoSampler;layout(binding=7) uniform texture2D texDepth;layout(binding=8) uniform sampler texDepthSampler;layout(binding=7) uniform texture2D texParam1;layout(binding=8) uniform sampler texParam1Sampler;
#endif
layout(location=0) out vec4 outColor;struct Light{vec3 Posision;vec3 Color;};struct PBRParam{float NdotL;float NdotV;float NdotH;float LdotH;float VdotH;float perceptualRoughness;float metallic;vec3 reflectance0;vec3 reflectance90;float alphaRoughness;vec3 diffuseColor;vec3 specularColor;};float t(PBRParam t){float u=t.alphaRoughness*t.alphaRoughness,f=(t.NdotH*u-t.NdotH)*t.NdotH+1.;return u/(acos(-1.)*f*f);}float e(PBRParam t){float u=t.NdotL,f=t.NdotV,v=t.alphaRoughness;return 2.*u/(u+sqrt(v*v+(1.-v*v)*(u*u)))*(2.*f/(f+sqrt(v*v+(1.-v*v)*(f*f))));}vec3 u(PBRParam t){return t.reflectance0+(t.reflectance90-t.reflectance0)*pow(clamp(1.-t.VdotH,0.,1.),5.);}vec3 e(vec3 v,vec3 f,vec3 s,bool r,bool z,vec3 g,float b,float l){vec4 i=vec4(1);l=clamp(l,.04,1.);b=clamp(b,0.,1.);float n=l*l;vec4 c=vec4(v,1);v=vec3(.04);vec3 P=c.xyz*(vec3(1)-v)*(1.-b),d=mix(v,c.xyz,b),h=f;f=-1.f*normalize(s-fragUBO.cameraPos.xyz);v=g;if(r){vec3 t=fragUBO.lightPos.xyz;v=-1.f*normalize(s-t);}g=normalize(f+v);float m=clamp(dot(h,v),0.,1.),y=clamp(abs(dot(h,f)),0.,1.),o=clamp(dot(v,g),0.,1.);PBRParam U=PBRParam(m,y,clamp(dot(h,g),0.,1.),o,clamp(dot(f,g),0.,1.),l,b,d.xyz,vec3(1)*clamp(max(max(d.x,d.y),d.z)*25.,0.,1.),n,P,d);P=vec3(0);d=vec3(0);o=t(U);n=e(U);h=u(U);if(m>0.||y>0.)P=max(P+o*n*h/(4.*m*y),vec3(0)),d+=(1.-h)*(U.diffuseColor/acos(-1.)),i.xyz=m*(P+d);P=clamp(P,.04,1.);i.xyz+=P*d;i.xyz=pow(i.xyz,vec3(1./2.2));if(r){float t=length(s-fragUBO.lightPos.xyz);i.xyz*=exp(-1.*t*.25);}else if(z){float t=length(s-fragUBO.cameraPos.xyz);i.xyz*=exp(-1.*t*.25);}return i.xyz;}void main(){vec4 t=vec4(0,0,0,1);vec2 g=fUV;
#ifdef USE_OPENGL
vec4 u=texture(texGPosition,g);
#else
vec4 s=texture(sampler2D(texGPosition,texGPositionSampler),g);
#endif

#ifdef USE_OPENGL
vec4 U=texture(texGNormal,g);
#else
vec4 i=texture(sampler2D(texGNormal,texGNormalSampler),g);
#endif

#ifdef USE_OPENGL
vec4 P=texture(texGAlbedo,g);
#else
vec4 v=texture(sampler2D(texGAlbedo,texGAlbedoSampler),g);
#endif

#ifdef USE_OPENGL
vec4 f=texture(texDepth,g);
#else
vec4 c=texture(sampler2D(texDepth,texDepthSampler),g);
#endif

#ifdef USE_OPENGL
vec4 n=texture(texParam1,g);
#else
vec4 b=texture(sampler2D(texParam1,texParam1Sampler),g);
#endif
vec3 z=i.xyz,d=v.xyz,h=s.xyz;float m=floor(b.x);bool o=floor(b.y)==1.,l=floor(b.y)==2.;float r=b.z,y=b.w;vec3 L=normalize(vec3(1,-1,1));if(m==1.)t.xyz+=max(0.,dot(L,z))*d;else if(m==2.)t.xyz=e(d,z,h,o,l,-1.f*normalize(vec3(1,-1,1)),r,y);else if(m==3.){for(int v=0;v<4;v++){vec3 g=vec3(v%2==0?1.:-1.,1,v%2==0?1.:-1.);t.xyz+=e(d,z,h,false,false,g,r,y);}t.xyz*=.5;}else if(m==4.)t.xyz=d;outColor=t;gl_FragDepth=c.x;}