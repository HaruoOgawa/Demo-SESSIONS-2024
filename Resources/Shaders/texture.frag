#version 450

layout(location = 0) in vec2 fUV;

#ifdef USE_OPENGL
layout(binding = 0) uniform sampler2D texImage;
#else
layout(binding = 0) uniform texture2D texImage;
layout(binding = 1) uniform sampler texSampler;
#endif

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