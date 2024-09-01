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

	int IsXBlur;
	int iPad0;
	int iPad1;
	int iPad2;
} frag_ubo;

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

	// ガウス重みを計算するための係数
	float weights[5] = float[](0.227027, 0.316216, 0.070270, 0.002216, 0.000167);

	vec2 BlurDir = vec2((frag_ubo.IsXBlur == 1)? 1.0 : 0.0, (frag_ubo.IsXBlur == 1)? 0.0 : 1.0);

	for(int i = -4; i <= 4; i++)
	{
		col += GetTexColor(st + texelSize * i * BlurDir) * weights[abs(i)];
	}

	outColor = vec4(col, 1.0);
}