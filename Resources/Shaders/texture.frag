#version 450

layout(location = 0) in vec2 fUV;

layout(binding = 0) uniform sampler2D texImage;


layout(location = 0) out vec4 outColor;

void main()
{
	vec4 col = vec4(1.0); 
	vec2 st = fUV;

	col.rgb = texture(texImage, st).rgb;

	outColor = col;
}