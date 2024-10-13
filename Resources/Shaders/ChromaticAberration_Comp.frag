#version 450
layout(location=0) in vec2 fUV;
#ifdef USE_OPENGL
layout(binding=0) uniform sampler2D texImage;
#else
layout(binding=0) uniform texture2D texImage;layout(binding=1) uniform sampler texSampler;
#endif
layout(location=0) out vec4 outColor;vec3 t(vec2 t){vec4 o=vec4(0);
#ifdef USE_OPENGL
o.xyz=texture(texImage,t).xyz;
#else
o.xyz=texture(sampler2D(texImage,texSampler),t).xyz;
#endif
return o.xyz;}float f(vec2 t){return fract(sin(dot(t,vec2(12.9898,78.233)))*43758.5453123);}void main(){vec3 o=vec3(0);vec2 v=fUV,s=v*2.-1.,z=normalize(s),b=v;if(floor(frag_ubo.useSlide)==1.){float o=sin(f(vec2(floor(v.y*50.)/50.,1.159))*50.+frag_ubo.time*1e2)*.1;b=mix(b,b+vec2(o,0),frag_ubo.slideRate);}o.x=t(b+vec2(.002)*z).x;o.y=t(b-vec2(.002)*z).y;o.z=t(b+vec2(.004)*z).z;o.x+=f(v+.1+vec2(frag_ubo.cameraPos.x))*.075;o.y+=f(v+.2+vec2(frag_ubo.cameraPos.y))*.075;o.z+=f(v+.3+vec2(frag_ubo.cameraPos.z))*.075;o=mix(o,vec3(1),frag_ubo.whiteRate);if(abs(s.y)>.8)o=vec3(0);outColor=vec4(o,1);}