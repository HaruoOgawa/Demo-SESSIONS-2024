#version 450
layout(location=0) in vec2 fUV;
#ifdef USE_OPENGL
layout(binding=1) uniform sampler2D texGPosition;layout(binding=3) uniform sampler2D texGNormal;layout(binding=5) uniform sampler2D texGAlbedo;layout(binding=7) uniform sampler2D texDepth;layout(binding=9) uniform sampler2D texParam1;
#else
layout(binding=1) uniform texture2D texGPosition;layout(binding=2) uniform sampler texGPositionSampler;layout(binding=3) uniform texture2D texGNormal;layout(binding=4) uniform sampler texGNormalSampler;layout(binding=5) uniform texture2D texGAlbedo;layout(binding=6) uniform sampler texGAlbedoSampler;layout(binding=7) uniform texture2D texDepth;layout(binding=8) uniform sampler texDepthSampler;layout(binding=9) uniform texture2D texParam1;layout(binding=10) uniform sampler texParam1Sampler;
#endif
layout(location=0) out vec4 gPosition;layout(location=1) out vec4 gNormal;layout(location=2) out vec4 gAlbedo;layout(location=3) out vec4 gDepth;layout(location=4) out vec4 gParam_1;void main(){vec2 t=fUV;
#ifdef USE_OPENGL
gPosition=texture(texGPosition,t);
#else
gPosition=texture(sampler2D(texGPosition,texGPositionSampler),t);
#endif

#ifdef USE_OPENGL
gNormal=texture(texGNormal,t);
#else
gNormal=texture(sampler2D(texGNormal,texGNormalSampler),t);
#endif

#ifdef USE_OPENGL
gAlbedo=texture(texGAlbedo,t);
#else
gAlbedo=texture(sampler2D(texGAlbedo,texGAlbedoSampler),t);
#endif

#ifdef USE_OPENGL
gDepth=texture(texDepth,t);
#else
gDepth=texture(sampler2D(texDepth,texDepthSampler),t);
#endif

#ifdef USE_OPENGL
gParam_1=texture(texParam1,t);
#else
gParam_1=texture(sampler2D(texParam1,texParam1Sampler),t);
#endif
}