#version 450

layout(location = 0) in vec2 fUV;

#ifdef USE_OPENGL
layout(binding = 0) uniform sampler2D texImage;
layout(binding = 2) uniform sampler2D depthImage;
layout(binding = 4) uniform sampler2D posImage;
layout(binding = 6) uniform sampler2D normalImage;
layout(binding = 8) uniform sampler2D metallicRoughnessImage;
#else
layout(binding = 0) uniform texture2D texImage;
layout(binding = 1) uniform sampler texSampler;
layout(binding = 2) uniform texture2D depthImage;
layout(binding = 3) uniform sampler depthSampler;
layout(binding = 4) uniform texture2D posImage;
layout(binding = 5) uniform sampler posSampler;
layout(binding = 6) uniform texture2D normalImage;
layout(binding = 7) uniform sampler normalSampler;
layout(binding = 8) uniform texture2D metallicRoughnessImage;
layout(binding = 9) uniform sampler metallicRoughnessSampler;
#endif

layout(binding = 10) uniform FragUniformBuffer
{
	mat4 model;
    mat4 view;
    mat4 proj;
	mat4 lightVPMat;

	vec4 lightPos;

	float fPad0;
	float fPad1;
	float fPad2;
	float fPad3;
} frag_ubo;

layout(location = 0) out vec4 outColor;

vec3 GetMainCol(vec2 texcoord)
{
	vec4 col = vec4(0.0);

	#ifdef USE_OPENGL
	col.rgb = texture(texImage, texcoord).rgb;
	#else
	col.rgb = texture(sampler2D(texImage, texSampler), texcoord).rgb;
	#endif

	return col.rgb;
}

float GetDepth(vec2 texcoord)
{
	float depth = 1.0;

	#ifdef USE_OPENGL
	depth = texture(depthImage, texcoord).r;
	#else
	depth = texture(sampler2D(depthImage, depthSampler), texcoord).r;
	#endif

	return depth;
}

vec3 GetPosCol(vec2 texcoord)
{
	vec4 col = vec4(0.0);

	#ifdef USE_OPENGL
	col.rgb = texture(posImage, texcoord).rgb;
	#else
	col.rgb = texture(sampler2D(posImage, posSampler), texcoord).rgb;
	#endif

	return col.rgb;
}

vec3 GetNormalCol(vec2 texcoord)
{
	vec4 col = vec4(0.0);

	#ifdef USE_OPENGL
	col.rgb = texture(normalImage, texcoord).rgb;
	#else
	col.rgb = texture(sampler2D(normalImage, normalSampler), texcoord).rgb;
	#endif

	return col.rgb;
}

vec2 GetMetallicRoughness(vec2 texcoord)
{
	#ifdef USE_OPENGL
	vec4 col = texture(metallicRoughnessImage, texcoord);
	#else
	vec4 col = texture(sampler2D(metallicRoughnessImage, metallicRoughnessSampler), texcoord);
	#endif

	return col.ba;
}

void main()
{
	vec3 col = vec3(0.0);
	vec2 st = fUV;

	vec3 WorldPos = GetPosCol(st);

	col = WorldPos;

	outColor = vec4(col, 1.0);
}