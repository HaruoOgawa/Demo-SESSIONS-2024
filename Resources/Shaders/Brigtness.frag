#version 450

layout(location = 0) in vec2 fUV;

#ifdef USE_OPENGL
layout(binding = 0) uniform sampler2D texImage;
#else
layout(binding = 0) uniform texture2D texImage;
layout(binding = 1) uniform sampler texSampler;
#endif

layout(binding = 2) uniform FragUniformBuffer
{
	mat4 mPad0;
	mat4 mPad1;
	mat4 mPad2;
	mat4 mPad3;

	float Threshold;
	float Intencity;
	float fPad0;
	float fPad1;
} frag_ubo;

layout(location = 0) out vec4 outBrigtnessColor;
layout(location = 1) out vec4 outColor;

void main()
{
	vec4 col = vec4(1.0); 
	vec2 st = fUV;

	#ifdef USE_OPENGL
	col.rgb = texture(texImage, st).rgb;
	#else
	col.rgb = texture(sampler2D(texImage, texSampler), st).rgb;
	#endif

	vec4 BrigtnessCol = col;
	BrigtnessCol.rgb = max(vec3(0.0), BrigtnessCol.rgb - frag_ubo.Threshold) * frag_ubo.Intencity;

	outColor = col;
	outBrigtnessColor = BrigtnessCol;
}