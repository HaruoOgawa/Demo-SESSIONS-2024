#version 450

layout(location = 0) in vec2 fUV;

#ifdef USE_OPENGL
layout(binding = 0) uniform sampler2D texImage;
layout(binding = 2) uniform sampler2D depthImage;
#else
layout(binding = 0) uniform texture2D texImage;
layout(binding = 1) uniform sampler texSampler;
layout(binding = 2) uniform texture2D depthImage;
layout(binding = 3) uniform sampler depthSampler;
#endif

layout(binding = 4) uniform FragUniformBuffer
{
	mat4 model;
    mat4 view;
    mat4 proj;
	mat4 lightVPMat;

	vec4 lightPos;

	float exposure; // 光の露出
	float decay; // 光の減衰
	float density; // 光の密度
	float weight; // サンプルの重み

	float numSamples; // サンプル数
	float fPad0;
	float fPad1;
	float fPad2;
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

void main()
{
	vec2 st = fUV;
	vec2 texcoord = st;

	// スクリーン座標系でのライト位置
	vec4 TmpScreenLightPos = (frag_ubo.proj * frag_ubo.view * vec4(frag_ubo.lightPos.xyz, 1.0));
	vec3 ScreenLightPos = TmpScreenLightPos.xyz / TmpScreenLightPos.w;

	// Pixel To Light Vector
	vec2 deltaTexcoord = texcoord - (ScreenLightPos.xy);

	// ベクトルの長さをサンプル数で分割して、密度(dencity)の分だけスケールする
	deltaTexcoord *= (1.0 / frag_ubo.numSamples) * frag_ubo.density;

	// 初期カラーを保持
	vec3 col = GetMainCol(texcoord);

	// 照明の減衰量を初期化
	float illuminationDecay = 1.0;

	// 現在の深度
	float currentDepth = GetDepth(st);

	// レイマーチングによるサンプリングを行う
	for(float i = 0.0; i < frag_ubo.numSamples; i++)
	{
		// deltaTexcoordの分だけレイを進める
		texcoord -= deltaTexcoord;

		vec3 sampler = GetMainCol(texcoord);

		/*// サンプル位置の深度を取得
		float sampleDepth = GetDepth(texcoord);

		// 深度に基づいて光の遮蔽を判断
		if(sampleDepth < currentDepth)
		{
			// 光が遮断されている場合、光の強度を減少させる
			illuminationDecay *= frag_ubo.decay;
		}*/

		// 減衰させる
		sampler *= illuminationDecay * frag_ubo.weight;

		//
		illuminationDecay *= frag_ubo.decay;

		col += sampler;
	}

	// 露出を調整
	col *= frag_ubo.exposure;

	outColor = vec4(col, 1.0);
}