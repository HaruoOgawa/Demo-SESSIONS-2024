#version 450
layout(location=0) in vec3 fWolrdNormal;layout(location=1) in vec2 fUV;layout(location=2) in vec3 fWorldPos;layout(location=0) out vec4 gPosition;layout(location=1) out vec4 gNormal;layout(location=2) out vec4 gAlbedo;layout(location=3) out vec4 gDepth;layout(location=4) out vec4 gParam_1;
layout(binding = 1) uniform FragUniformBufferObject{mat4 model;mat4 view;mat4 proj;mat4 lightVPMat;float maxWidth;float charWidth;float numOfChar;float textID;} f_ubo;
layout(binding=2) uniform sampler2D MainTexture;
float v(vec3 v){vec4 o=f_ubo.proj*f_ubo.view*vec4(v,1);float l=o.z/o.w*.5+.5,n=l*l,f=dFdx(l);l=dFdy(l);return n+.25*(f*f+l*l);}void main(){vec4 o=vec4(0,0,0,1);vec2 l=fUV;float n=1./f_ubo.maxWidth*f_ubo.charWidth;l.x*=n;l.x+=n*floor(f_ubo.textID);
float f=texture(MainTexture,vec2(l.x,1.-l.y)).x;
float M=smoothstep(.49,.51,f);if(M>.5){o.xyz=vec3(1);float l=v(fWorldPos);gPosition=vec4(fWorldPos,1);gNormal=vec4(fWolrdNormal,1);gAlbedo=vec4(vec3(1),1);gDepth=vec4(vec3(l),1);gParam_1=vec4(4,0,0,0);gl_FragDepth=l;}else discard;}