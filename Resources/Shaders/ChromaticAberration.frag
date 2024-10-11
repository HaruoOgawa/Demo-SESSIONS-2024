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
	mat4 model;
    mat4 view;
    mat4 proj;
	mat4 lightVPMat;

	vec4 cameraPos;

	float whiteRate;
	float time;
	float useSlide;
	float slideRate;
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

float rand(vec2 st)
{
	return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main()
{
	vec3 col = vec3(0.0);
	vec2 texcoord = fUV;
	vec2 st = texcoord * 2.0 - 1.0;

	float w = 0.002;
	vec2 dir = normalize(st);

	vec2 baseUV = texcoord;

	if(floor(frag_ubo.useSlide) == 1.0)
	{
		float w = 50.0;
		float id = floor(texcoord.y * w) / w;

		float offset = sin(rand(vec2(id, 1.159)) * w + frag_ubo.time * 100.0) * 0.1;

		baseUV = mix(baseUV, baseUV + vec2(offset, 0.0), frag_ubo.slideRate);
	}

	col.r = GetMainCol(baseUV + vec2(w) * dir).r;
	col.g = GetMainCol(baseUV - vec2(w) * dir).g;
	col.b = GetMainCol(baseUV + vec2(w * 2.0) * dir).b;

	col.r += rand(texcoord + 0.1 + vec2(frag_ubo.cameraPos.x)) * 0.075;
	col.g += rand(texcoord + 0.2 + vec2(frag_ubo.cameraPos.y)) * 0.075;
	col.b += rand(texcoord + 0.3 + vec2(frag_ubo.cameraPos.z)) * 0.075;

	// ホワイトアウト
	col = mix(col, vec3(1.0), frag_ubo.whiteRate);

	// 映画フィルム
	// もしかしたらの別のフィルターとして移動するかも？
	if(abs(st.y) > 0.8) col = vec3(0.0);

	outColor = vec4(col, 1.0);
}