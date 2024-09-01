#version 450

layout(location = 0) in vec2 fUV;

#ifdef USE_OPENGL
layout(binding = 0) uniform sampler2D texImage;
layout(binding = 2) uniform sampler2D depthImage;
#else
layout(binding = 0) uniform texture2D texImage;
layout(binding = 1) uniform sampler texSampler;
layout(binding = 2) uniform texture2D depthImage;
layout(binding = 3) uniform sampler depthSampler;
#endif

layout(binding = 4) uniform FragUniformBuffer
{
	mat4 mPad0;
	mat4 mPad1;
	mat4 mPad2;
	mat4 mPad3;

	vec4 lightPos;

	float exposure; // 光の露出
	float decay; // 光の減衰
	float density; // 光の密度
	float weight; // サンプルの重み

	int numSamples; // サンプル数
	int iPad0;
	int iPad1;
	int iPad2;
} frag_ubo;

layout(location = 0) out vec4 outColor;

void main()
{
	vec4 col = vec4(1.0); 
	vec2 st = fUV;

	#ifdef USE_OPENGL
	col.rgb = texture(texImage, st).rgb;
	#else
	col.rgb = texture(sampler2D(texImage, texSampler), st).rgb;
	#endif

	outColor = col;
}