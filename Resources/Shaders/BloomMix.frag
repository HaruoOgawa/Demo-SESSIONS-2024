#version 450

layout(location = 0) in vec2 fUV;

#ifdef USE_OPENGL
layout(binding = 0) uniform sampler2D texImage;
layout(binding = 2) uniform sampler2D bloomImage;
#else
layout(binding = 0) uniform texture2D texImage;
layout(binding = 1) uniform sampler texSampler;
layout(binding = 2) uniform texture2D bloomImage;
layout(binding = 3) uniform sampler bloomSampler;
#endif

layout(location = 0) out vec4 outColor;

void main()
{
	vec3 col = vec3(0.0); 
	vec2 st = fUV;

	// Main Color
	#ifdef USE_OPENGL
	vec3 mainCol = texture(texImage, st).rgb;
	#else
	vec3 mainCol = texture(sampler2D(texImage, texSampler), st).rgb;
	#endif

	// Bloom Color
	#ifdef USE_OPENGL
	vec3 bloomCol = texture(bloomImage, st).rgb;
	#else
	vec3 bloomCol = texture(sampler2D(bloomImage, bloomSampler), st).rgb;
	#endif

	// Mix Bloom
	col = mainCol + bloomCol;

	outColor = vec4(col, 1.0);
}