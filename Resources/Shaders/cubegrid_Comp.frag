#version 450
layout(location=0) in vec4 v2f_ObjectPos;layout(location=1) in vec2 v2f_UV;layout(location=0) out vec4 gPosition;layout(location=1) out vec4 gNormal;layout(location=2) out vec4 gAlbedo;layout(location=3) out vec4 gDepth;layout(location=4) out vec4 gParam_1;
layout(binding = 1) uniform FragUniformBufferObject{mat4 invModel;mat4 model;mat4 view;mat4 proj;vec4 cameraPos;vec4 mainColor;vec4 placeCubeSize;vec4 patternCol;vec2 resolution;float time;float deltaTime;float zLength;float lowGridRadius;float placeMode;float someTallMode;float ceilingOffsset;float usePattern;float glowPower;float expandRadius;float LightParam;float useZAnim;float hRate;float fPad2;} fragUbo;
#define repeat(p,a)mod(p,a)-a*0.5
float v;struct MatInfo{float Dist;float MatID;vec3 Albedo;};MatInfo f(MatInfo o,float v,vec3 f){if(v<o.Dist)o.Dist=v,o.MatID=2.,o.Albedo=f;return o;}float f(vec3 v,vec3 a){return length(max(vec3(0),abs(v)-a));}MatInfo p(vec3 l,vec3 o){MatInfo i;i.Dist=1e5;i.MatID=0;i.Albedo=vec3(0);float p=((fract(sin(dot(o.xz,vec2(12.9898,78.233)))*43758.5453123)*2.-1.)*.5+.5)*2.;vec3 n=fragUbo.mainColor.xyz;if(floor(fragUbo.placeMode)==0.){if(length(o.xz)<fragUbo.lowGridRadius){float v=p*.1;p=v;}if(length(o.xz)<fragUbo.expandRadius){float v=min(.5,exp(fragUbo.expandRadius-length(o.xz))*.25);p+=v;}}else if(floor(fragUbo.placeMode)==1.){float f=p*.1;p=f;if(abs(o.x)>fragUbo.placeCubeSize.x){float v=abs(o.x)-fragUbo.placeCubeSize.x;f=(f+min(.5,exp(v*1.5)*.05))*3.5;}if(v>30.)f+=exp(abs(v*.1))*.1;f*=clamp(fragUbo.hRate,.5,1.);p=mix(p,f,fragUbo.hRate);}float g=f(l+vec3(0,2.5,0),vec3(.05,p,.05));i=f(i,g,n);g=f(l-vec3(0,2.5+fragUbo.ceilingOffsset,0),vec3(.05,p,.05));return f(i,g,n);}vec3 t(vec3 v,vec3 o){vec2 n=vec2(.001,0);return normalize(vec3(p(v+n.xyy,o).Dist-p(v-n.xyy,o).Dist,p(v+n.yxy,o).Dist-p(v-n.yxy,o).Dist,p(v+n.yyx,o).Dist-p(v-n.yyx,o).Dist));}float f(vec3 v){vec4 o=fragUbo.proj*fragUbo.view*vec4(v,1);float f=o.z/o.w*.5+.5,n=f*f,l=dFdx(f);f=dFdy(f);return n+.25*(l*l+f*f);}vec3 s(vec2 v,vec2 o){vec2 f=floor((v+o*.01*.1)/.1)*.1+.05;v=(-v+f)/o+abs(.05/o);return vec3(f,min(v.x,v.y));}vec2 p(vec2 v){v=fract(v);float f=.123,o=0.,l=0.;f=fract(f*9184.928);float n,i;i=v.x;l+=pow(clamp(1.-abs(i),0.,1.),1e3);i=v.y;l+=pow(clamp(1.-abs(i),0.,1.),1e3);i=v.x-1.;l+=pow(clamp(3.-abs(i),0.,1.),1e3);i=v.y-1.;l+=pow(clamp(1.-abs(i),0.,1.),1e4);for(int g=0;g<12;g++){n=.5+(f-.5)*.9;i=v.x-n;l+=pow(clamp(1.-abs(i),0.,1.),2e2);if(i>0.)f=fract(f*4829.013),v.x=(v.x-n)/(1.-n),o+=1.;else f=fract(f*1239.528),v.x=v.x/n;v=v.yx;}o/=float(12);return vec2(l,o);}void main(){vec2 o=v2f_UV*2.-1.;o.x*=fragUbo.resolution.x/fragUbo.resolution.y;vec4 n=fragUbo.cameraPos;vec3 i=(fragUbo.invModel*n).xyz,l=normalize(v2f_ObjectPos.xyz-i);i+=n.xyz;if(floor(fragUbo.useZAnim)==1.)i.z+=fragUbo.time;float g=0.,e=0.;vec3 x=i+l*g,a;o=normalize(l.xz);float D=1./length(l.xz);MatInfo r;r.Dist=1e5;r.MatID=0.;r.Albedo=vec3(0);for(int f=0;f<512;f++){if(g>=e){g=e;x=i+l*g;vec3 v=s(x.xz,o);a=vec3(v.x,0,v.y);e+=v.z*D;}r=p(x-a,a);g+=r.Dist;x=i+l*g;v=g;if(abs(r.Dist)<.001)break;}if(r.Dist<.001){vec3 v=t(x-a,a);if(floor(fragUbo.useZAnim)==1.)x-=vec3(0,0,fragUbo.time);float o=f(x);if(floor(fragUbo.usePattern)==1.){vec3 v=vec3(0);for(int f=0;f<1;f++){vec3 o=x;vec2 i=vec2(0);if(f==0)i=o.xy*.5;else if(f==1)i=o.yz*.5;else if(f==2)i=o.xz*.5;i=p(i);float n=i.x;if(i.x<1.3)n=0.;v+=vec3(n);}v=clamp(v,0.,1.);if(length(v)>0.)r.Albedo=fragUbo.patternCol.xyz*fragUbo.glowPower,r.MatID=4.;}gPosition=vec4(x,1);gNormal=vec4(v,1);gAlbedo=vec4(r.Albedo,1);gDepth=vec4(vec3(o),1);gParam_1=vec4(r.MatID,fragUbo.LightParam,.1,0);gl_FragDepth=o;}else discard;}