#version 450

layout(location = 0) in vec2 fUV;

#ifdef USE_OPENGL
layout(binding = 0) uniform sampler2D texImage;
#else
layout(binding = 0) uniform texture2D texImage;
layout(binding = 1) uniform sampler texSampler;
#endif

layout(location = 0) out vec4 outColor;

vec3 GetTexColor(vec2 texcoord)
{
	vec4 col = vec4(0.0);

	#ifdef USE_OPENGL
	col.rgb = texture(texImage, texcoord).rgb;
	#else
	col.rgb = texture(sampler2D(texImage, texSampler), texcoord).rgb;
	#endif

	return col.rgb;
}

void main()
{
	vec3 col = vec3(0.0); 
	vec2 st = fUV;

	#ifdef USE_OPENGL
	vec2 texelSize = 1.0 / textureSize(texImage, 0);
	#else
	vec2 texelSize = 1.0 / textureSize(sampler2D(texImage, texSampler), 0);
	#endif

	// 2x2ピクセルを平均化して縮小
	col += GetTexColor(st + texelSize * vec2(-0.5, -0.5));
	col += GetTexColor(st + texelSize * vec2(-0.5, -0.5));
	col += GetTexColor(st + texelSize * vec2(-0.5, -0.5));
	col += GetTexColor(st + texelSize * vec2(-0.5, -0.5));

	// ピクセルの平均をとる
	col *= 0.25;

	outColor = vec4(col, 1.0);
}