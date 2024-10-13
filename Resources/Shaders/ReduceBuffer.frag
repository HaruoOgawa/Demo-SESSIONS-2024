#version 450

layout(location = 0) in vec2 fUV;

layout(binding = 0) uniform sampler2D texImage;


layout(location = 0) out vec4 outColor;

vec3 GetTexColor(vec2 texcoord)
{
	vec4 col = vec4(0.0);

	col.rgb = texture(texImage, texcoord).rgb;

	return col.rgb;
}

void main()
{
	vec3 col = vec3(0.0); 
	vec2 st = fUV;

	vec2 texelSize = 1.0 / textureSize(texImage, 0);
	

	// 2x2ピクセルを平均化して縮小
	col += GetTexColor(st + texelSize * vec2(-0.5, -0.5));
	col += GetTexColor(st + texelSize * vec2(-0.5, -0.5));
	col += GetTexColor(st + texelSize * vec2(-0.5, -0.5));
	col += GetTexColor(st + texelSize * vec2(-0.5, -0.5));

	// ピクセルの平均をとる
	col *= 0.25;

	outColor = vec4(col, 1.0);
}