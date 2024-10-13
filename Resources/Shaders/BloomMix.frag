#version 450

layout(location = 0) in vec2 fUV;

layout(binding = 0) uniform sampler2D texImage;
layout(binding = 2) uniform sampler2D bloomImage;


layout(location = 0) out vec4 outColor;

void main()
{
	vec3 col = vec3(0.0); 
	vec2 st = fUV;

	// Main Color
	vec3 mainCol = texture(texImage, st).rgb;

	// Bloom Color
	vec3 bloomCol = texture(bloomImage, st).rgb;

	// Mix Bloom
	col = mainCol + bloomCol;

	outColor = vec4(col, 1.0);
}