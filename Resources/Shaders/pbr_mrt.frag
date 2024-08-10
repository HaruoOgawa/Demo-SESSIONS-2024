#version 450

layout(location = 0) in vec3 f_WorldNormal;
layout(location = 1) in vec2 f_Texcoord;
layout(location = 2) in vec4 f_WorldPos;
layout(location = 3) in vec3 f_WorldTangent;
layout(location = 4) in vec3 f_WorldBioTangent;
layout(location = 5) in vec4 f_LightSpacePos;

layout(location = 0) out vec4 gPosition;
layout(location = 1) out vec4 gNormal;
layout(location = 2) out vec4 gAlbedo;
layout(location = 3) out vec4 gDepth;

layout(binding = 0) uniform UniformBufferObject{
	mat4 model;
    mat4 view;
    mat4 proj;
	mat4 lightVPMat;

	vec4 lightDir;
	vec4 lightColor;
	vec4 cameraPos;

	vec4 baseColorFactor;
	vec4 emissiveFactor;

    float time;
    float metallicFactor;
    float roughnessFactor;
    float normalMapScale;

	float occlusionStrength;
    // MipCountには反射キューブマップかIBLのSpecularMapの値が入っている(これらは必ずどちらか一方しか使用されないため)
	float mipCount;
    float ShadowMapX;
    float ShadowMapY;

    int   useBaseColorTexture;
    int   useMetallicRoughnessTexture;
    int   useEmissiveTexture;
    int   useNormalTexture;
    
    int   useOcclusionTexture;
    int   useCubeMap;
    int   useShadowMap;
    int   useIBL;

	int   useSkinMeshAnimation;
    int   useDirCubemap;
    int   pad1;
    int   pad2;
} ubo;

#ifdef USE_OPENGL
layout(binding = 2) uniform sampler2D baseColorTexture;
layout(binding = 4) uniform sampler2D metallicRoughnessTexture;
layout(binding = 6) uniform sampler2D emissiveTexture;
layout(binding = 8) uniform sampler2D normalTexture;
layout(binding = 10) uniform sampler2D occlusionTexture;
layout(binding = 12) uniform samplerCube cubemapTexture;
layout(binding = 14) uniform sampler2D shadowmapTexture;
layout(binding = 16) uniform sampler2D IBL_Diffuse_Texture;
layout(binding = 18) uniform sampler2D IBL_Specular_Texture;
layout(binding = 20) uniform sampler2D IBL_GGXLUT_Texture;
layout(binding = 22) uniform sampler2D cubeMap2DTexture;
#else
layout(binding = 2) uniform texture2D baseColorTexture;
layout(binding = 3) uniform sampler baseColorTextureSampler;

layout(binding = 4) uniform texture2D metallicRoughnessTexture;
layout(binding = 5) uniform sampler metallicRoughnessTextureSampler;

layout(binding = 6) uniform texture2D emissiveTexture;
layout(binding = 7) uniform sampler emissiveTextureSampler;

layout(binding = 8) uniform texture2D normalTexture;
layout(binding = 9) uniform sampler normalTextureSampler;

layout(binding = 10) uniform texture2D occlusionTexture;
layout(binding = 11) uniform sampler occlusionTextureSampler;

layout(binding = 12) uniform textureCube cubemapTexture;
layout(binding = 13) uniform sampler cubemapTextureSampler;

layout(binding = 14) uniform texture2D shadowmapTexture;
layout(binding = 15) uniform sampler shadowmapTextureSampler;

layout(binding = 16) uniform texture2D IBL_Diffuse_Texture;
layout(binding = 17) uniform sampler IBL_Diffuse_TextureSampler;

layout(binding = 18) uniform texture2D IBL_Specular_Texture;
layout(binding = 19) uniform sampler IBL_Specular_TextureSampler;

layout(binding = 20) uniform texture2D IBL_GGXLUT_Texture;
layout(binding = 21) uniform sampler IBL_GGXLUT_TextureSampler;

layout(binding = 22) uniform texture2D cubeMap2DTexture;
layout(binding = 23) uniform sampler cubeMap2DTextureSampler;
#endif

// なんかUnityPBRでもみた値だなぁ
const float MIN_ROUGHNESS = 0.04;
const float PI = 3.14159265;

struct PBRParam
{
	float NdotL;
	float NdotV;
	float NdotH;
	float LdotH;
	float VdotH;
	float perceptualRoughness;
	float metallic;
	vec3 reflectance0;
	vec3 reflectance90;
	float alphaRoughness;
	vec3 diffuseColor;
	vec3 specularColor;
};

// マイクロファセット(微小面法線分布関数)(Microfacet Distribution). Distributionは分布に意味
// 分布関数なので統計学的に求められた数式
// マイクロファセットの面積を返す
// 面積が小さいほどマイクロファセットが散らばっていて荒いということかな？ → 大きいほど凸凹のない一つの平面に近づく
// https://learnopengl.com/PBR/Theory#:~:text=GGX%20for%20G.-,Normal%20distribution%20function,-The%20normal%20distribution
float CalcMicrofacet(PBRParam param)
{
	float roughness2 = param.alphaRoughness * param.alphaRoughness; // グラフの勾配を高くする
	
	//
	float f = (param.NdotH * roughness2 - param.NdotH) * param.NdotH + 1.0;
	// = ( param.NdotH * (roughness2 - 1.0) ) * param.NdotH + 1.0
	// = pow(param.NdotH, 2.0) * (roughness2 - 1.0) + 1.0
	// 数式と同じ形になる. (n・h)^2 * (a^2 - 1) + 1
	
	//
	return roughness2 / (PI * f * f);
}

// 幾何減衰項(Geometric Occlusion)
// マイクロファセットの微小平面が光の経路を遮断することにより失われてしまう光の減衰量を計算する関数
float CalcGeometricOcculusion(PBRParam param)
{
	float NdotL = param.NdotL;
	float NdotV = param.NdotV;
	// 表面が荒いほど、微小平面が増えて光が隠蔽されやすくなる
	float r = param.alphaRoughness;

	// 詳しい数式(https://google.github.io/filament/Filament.md.html#materialsystem/specularbrdf/geometricshadowing(specularg))
	// シャドウイングの項を計算(入射光が他の微小平面に遮られて影になり光が減衰する分)
	float attenuationL = 2.0 * NdotL / ( NdotL + sqrt(r * r + (1.0 - r * r) * (NdotL * NdotL)) );
	// = 2.0 * NdotL / ( NdotL * () )
	// マスキングの項を計算(反射光が他の微小平面に遮られてその光が目に届かないことで減衰する分)
	float attenuationV = 2.0 * NdotV / ( NdotV + sqrt(r * r + (1.0 - r * r) * (NdotV * NdotV)) );

	// 幾何減衰項は上記の乗算結果
	return attenuationL * attenuationV;
}

// フレネル反射(フレネル項). 
// フレネル反射とはView方向に応じて反射率が変化する物理現象のことである 
// ここでのGGX項でのフレネル反射はオブジェクトの端であるほど反射率が高い(反射色が明るい)ことを示している
// https://marmoset.co/posts/basic-theory-of-physically-based-rendering/
// この画像がわかりやすい --> https://marmoset.co/wp-content/uploads/2016/11/pbr_theory_fresnel.png
// GGXのフレネル項の式は、よく光学の分野で見聞きするようなフレネルの式の近似式である(https://ja.wikipedia.org/wiki/%E3%83%95%E3%83%AC%E3%83%8D%E3%83%AB%E3%81%AE%E5%BC%8F)
// https://learnopengl.com/PBR/Theory#:~:text=return%20ggx1%20*%20ggx2%3B%0A%7D-,Fresnel%20equation,-The%20Fresnel%20equation
vec3 CalcFrenelReflection(PBRParam param)
{
	// 基本の反射率: reflectance0
	// それに対して視野方向による反射率の変化分を加算している
	// 割と数式だとreflectance90は1.0なので今はあんまり深く考えなくてもいいかも？
	// もしかしてreflectance90は媒質の屈折率に関係している？真空だと1.0なので、他の数式とかだとひとます真空と仮定している？
	return param.reflectance0 + (param.reflectance90 - param.reflectance0) * pow(clamp(1.0 - param.VdotH, 0.0, 1.0), 5.0);
}

// ディフューズのBRDFを計算
// https://google.github.io/filament/Filament.md.html#materialsystem/diffusebrdf
// この記事によると拡散色のBRDFは近似的に『1.0 / PI』と定まるとのこと
vec3 CalcDiffuseBRDF(PBRParam param)
{
	return param.diffuseColor / PI;
}

// 法線の取得(ノーマルマップを使うことがある. → ついでに勉強する)
vec3 getNormal()
{
	vec3 nomral = vec3(0.0);

	if(ubo.useNormalTexture != 0)
	{
		// Tangent, SubTangent, Normalで構成される座標変換ベクトルを作成する
		// このような変換行列のことを頭文字をとって TBN Matrix と呼ぶ
		// 法線マップの示す法線方向は常に定数であり、オブジェクトを回転させるとワールド座標上の向きが合わなくなるので、座標変換して正しいものにする必要がある
		// 例えばZ軸正を示す法線マップを持つPlaneオブジェクトをX軸を基準に90度回転させると、法線方向はY軸正になるのが正しいはずなのに、法線マップの値が定数であるため、
		// そのままZ軸正を示しライティングがおかしなことになる
		// https://learnopengl.com/Advanced-Lighting/Normal-Mapping#:~:text=tangent%20space.-,Tangent%20space,-Normal%20vectors%20in
		// TBN Matrixの計算手法
		// 法線は良しなに.
		// 接点と複接線のベクトル方向がサーフェイスのテクスチャ座標の方向と一致しているということを利用して計算する(上記の接線空間の項目より)
		// 三角形の頂点とそのテクスチャ座標から接線と複接線を計算することができる
		// ※ これはメモだが接線空間記事のE1・E2が表すのは面積ではなく、P1・P2・P3を使った『ベクトル』
		// ※ なのでベクトルで三角形が作れれば計算はできるので、実質Planeではなくポリゴン単位で接線の計算を行うことができる
		// Shaderベースの頂点算出はパフォーマンス悪いので、ひとまず計算はCPUで行っている
		// 数式はこれ(https://drive.google.com/file/d/1A4WK5GLRzWRD9yt9_yxSjyz8Yrmb5Is8/view?usp=sharing)

		vec3 t = normalize(f_WorldTangent.xyz);
		vec3 b = normalize(f_WorldBioTangent.xyz);
		vec3 n = normalize(f_WorldNormal.xyz);

		mat3 tbn = mat3(t, b, n);

		#ifdef USE_OPENGL
		nomral = texture(normalTexture, f_Texcoord).rgb;
		#else
		nomral = texture(sampler2D(normalTexture, normalTextureSampler), f_Texcoord).rgb;
		#endif
		
		nomral = normalize( tbn * ((2.0 * nomral - 1.0) * vec3(ubo.normalMapScale, ubo.normalMapScale, 1.0)) );
	}
	else
	{
		nomral = f_WorldNormal;
	}

	return nomral;
}

// Lenearは光学に則した色空間(現実の光の仕組み
// sRGBはモニターに使われる色空間で人間の色の知覚に則している
// LinearよりsRGBの方が明るい
// https://www.willgibbons.com/linear-workflow/#:~:text=sRGB%20is%20a%20non%2Dlinear,curve%20applied%20to%20the%20brightness.
// https://lettier.github.io/3d-game-shaders-for-beginners/gamma-correction.html
vec4 SRGBtoLINEAR(vec4 srgbIn)
{
	return vec4(pow(srgbIn.xyz, vec3(2.2)), srgbIn.a);
}

vec4 LINEARtoSRGB(vec4 srgbIn)
{
	return vec4(pow(srgbIn.xyz, vec3(1.0 / 2.2)), srgbIn.a);
}

float linstep(float min, float max, float v)
{
	return clamp((v - min) / (max - min), 0.0, 1.0);
}

float ReduceLightBleeding(float p_max, float Amount)
{
	return linstep(Amount, 1.0, p_max);
}

vec2 ComputePCF(vec2 uv)
{
	vec2 moments = vec2(0.0);

	vec2 texelSize = vec2(1.0 / ubo.ShadowMapX, 1.0 / ubo.ShadowMapY);

	/*for(float x = -1.0; x <= 1.0; x++)
	{
		for(float y = -1.0; y <= 1.0; y++)
		{
			#ifdef USE_OPENGL
			moments += texture(shadowmapTexture, uv + vec2(x, y) * texelSize).rg;
			#else
			moments += texture(sampler2D(shadowmapTexture, shadowmapTextureSampler), uv + vec2(x, y) * texelSize).rg;
			#endif
		}
	}*/

	#ifdef USE_OPENGL
	moments += texture(shadowmapTexture, uv + vec2(-1.0, -1.0) * texelSize).rg;
	moments += texture(shadowmapTexture, uv + vec2(-1.0, 0.0) * texelSize).rg;
	moments += texture(shadowmapTexture, uv + vec2(-1.0, 1.0) * texelSize).rg;
	moments += texture(shadowmapTexture, uv + vec2(0.0, -1.0) * texelSize).rg;
	moments += texture(shadowmapTexture, uv + vec2(0.0, 0.0) * texelSize).rg;
	moments += texture(shadowmapTexture, uv + vec2(0.0, 1.0) * texelSize).rg;
	moments += texture(shadowmapTexture, uv + vec2(1.0, -1.0) * texelSize).rg;
	moments += texture(shadowmapTexture, uv + vec2(1.0, 0.0) * texelSize).rg;
	moments += texture(shadowmapTexture, uv + vec2(1.0, 1.0) * texelSize).rg;
	#else
	moments += texture(sampler2D(shadowmapTexture, shadowmapTextureSampler), uv + vec2(-1.0, -1.0) * texelSize).rg;
	moments += texture(sampler2D(shadowmapTexture, shadowmapTextureSampler), uv + vec2(-1.0, 0.0) * texelSize).rg;
	moments += texture(sampler2D(shadowmapTexture, shadowmapTextureSampler), uv + vec2(-1.0, 1.0) * texelSize).rg;
	moments += texture(sampler2D(shadowmapTexture, shadowmapTextureSampler), uv + vec2(0.0, -1.0) * texelSize).rg;
	moments += texture(sampler2D(shadowmapTexture, shadowmapTextureSampler), uv + vec2(0.0, 0.0) * texelSize).rg;
	moments += texture(sampler2D(shadowmapTexture, shadowmapTextureSampler), uv + vec2(0.0, 1.0) * texelSize).rg;
	moments += texture(sampler2D(shadowmapTexture, shadowmapTextureSampler), uv + vec2(1.0, -1.0) * texelSize).rg;
	moments += texture(sampler2D(shadowmapTexture, shadowmapTextureSampler), uv + vec2(1.0, 0.0) * texelSize).rg;
	moments += texture(sampler2D(shadowmapTexture, shadowmapTextureSampler), uv + vec2(1.0, 1.0) * texelSize).rg;
	#endif

	moments /= 9.0;

	#ifdef USE_OPENGL
	//moments = texture(shadowmapTexture, uv).rg;
	#else
	//moments = texture(sampler2D(shadowmapTexture, shadowmapTextureSampler), uv ).rg;
	#endif

	return moments;
}

float CalcShadow(vec3 lsp, vec3 nomral, vec3 lightDir)
{
	vec2 moments = ComputePCF(lsp.xy);

	// マッハバンド対策のShadow Bias
	// ShadowBiasとは深度のオフセットのこと
	// マッハバンドはShawMapの解像度により発生する。複数のフラグメントが光源から比較的離れている場合、深度マップから同じ値をサンプリングする可能性がある。
	// 光の入射角がオクルーダーの法線に対して斜めなとき、上記の理由から例えば少し深度が大きい隣の表面の深度をサンプリングしてしまい、結果ShadowMapの元の深度より大ききなってしまうことで縞々になる(大きいということは影になる, 黒色)
	// その対策でオクルーダーをほんの少しだけ手前にする。手前にすることでShadowmapよりも深度が小さくなるため影になりにくくなる
	// https://drive.google.com/file/d/1tyDT7xQVSYzKnZXt6vvDwt-rlWEjVGDP/view?usp=sharing
	// 床の法線とライト方向の成す角度が垂直になるほど、Biasを強くする
	// https://learnopengl.com/Advanced-Lighting/Shadows/Shadow-Mapping
	float ShadowBias = max(0.005, 0.05 * (1.0 - dot(nomral, lightDir)) );

	float distance = lsp.z - ShadowBias;

	// ShadowMapの深度よりも手前なので普通に描画する
	if((distance) <= moments.x)
	{
		return 1.0;
	}
	
	// 後ろなので影にする
	// バリアンスの計算
	float variance = moments.y - (moments.x * moments.x);
	variance = max(0.005, variance);

	float d = distance - moments.x;
	float p_max = variance / (variance + d * d);

	// 本来影になるところに光がにじんでいるようなアーティファクトが出ることがあるのでその対策
	//p_max = ReduceLightBleeding(0.1, p_max);

	return p_max;
}

vec2 CastDirToSt(vec3 Dir)
{
	float pi = 3.1415;

	float theta = acos(Dir.y);
	float phi = atan(Dir.z, Dir.x);

	vec2 st = vec2(phi / (2.0 * pi), theta / pi);

	return st;
}

vec3 ComputeReflectionColor(PBRParam pbrParam, vec3 v, vec3 n)
{
	// 反射カラーを計算
	vec3 reflectColor = vec3(0.0);
	if(ubo.useCubeMap != 0)
	{
		float mipCount = ubo.mipCount;
		float lod = mipCount * pbrParam.perceptualRoughness;
		#ifdef USE_OPENGL
		reflectColor = LINEARtoSRGB(textureLod(cubemapTexture, reflect(v, n), lod)).rgb;
		#else
		reflectColor = LINEARtoSRGB(textureLod(samplerCube(cubemapTexture, cubemapTextureSampler), reflect(v, n), lod)).rgb;
		#endif
	}
	else if(ubo.useDirCubemap != 0)
	{
		vec2 st = CastDirToSt(reflect(v, n));
		
		float mipCount = ubo.mipCount;
		float lod = mipCount * pbrParam.perceptualRoughness;
		#ifdef USE_OPENGL
		reflectColor = LINEARtoSRGB(textureLod(cubeMap2DTexture, st, lod)).rgb;
		#else
		reflectColor = LINEARtoSRGB(textureLod(sampler2D(cubeMap2DTexture, cubeMap2DTextureSampler), st, lod)).rgb;
		#endif
	}

	return reflectColor;
}

vec2 GetSphericalTexcoord(vec3 Dir)
{
	float pi = 3.1415;

	float theta = acos(Dir.y);
	float phi = atan(Dir.z, Dir.x);

	vec2 st = vec2(phi / (2.0 * pi), theta / pi);

	return st;
}

vec3 ComputeIBL(PBRParam pbrParam, vec3 v, vec3 n) 
{
	float mipCount = ubo.mipCount;
	float lod = mipCount * pbrParam.perceptualRoughness;

	// テクスチャ計算
	#ifdef USE_OPENGL
	vec3 brdf = SRGBtoLINEAR(texture(IBL_GGXLUT_Texture, vec2(pbrParam.NdotV, 1.0 - pbrParam.perceptualRoughness))).rgb;
	vec3 diffuseLight = SRGBtoLINEAR(texture(IBL_Diffuse_Texture, GetSphericalTexcoord(n))).rgb;
	vec3 specularLight = SRGBtoLINEAR(textureLod(IBL_Specular_Texture, GetSphericalTexcoord(reflect(v, n)), lod)).rgb;
	#else
	vec3 brdf = SRGBtoLINEAR(texture(sampler2D(IBL_GGXLUT_Texture, IBL_GGXLUT_TextureSampler), vec2(pbrParam.NdotV, 1.0 - pbrParam.perceptualRoughness))).rgb;
	vec3 diffuseLight = SRGBtoLINEAR(texture(sampler2D(IBL_Diffuse_Texture, IBL_Diffuse_TextureSampler), GetSphericalTexcoord(n))).rgb;
	vec3 specularLight = SRGBtoLINEAR(textureLod(sampler2D(IBL_Specular_Texture, IBL_Specular_TextureSampler), GetSphericalTexcoord(reflect(v, n)), lod)).rgb;
	#endif

	// 
	vec3 diffuse = diffuseLight * pbrParam.diffuseColor;
	vec3 specular = specularLight * (pbrParam.specularColor * brdf.x + brdf.y);

	return diffuse + specular;
}

void main(){
	vec4 col = vec4(1.0);

	// ラフネスとメタリックを取得。テクスチャにパッキングされていることもある
	float perceptualRoughness = ubo.roughnessFactor;
	float metallic = ubo.metallicFactor;

	if(ubo.useMetallicRoughnessTexture != 0)
	{
		// G Channel: Roughness Map, B Channel: Metallic Map 
		#ifdef USE_OPENGL
		vec4 metallicRoughnessColor = texture(metallicRoughnessTexture, f_Texcoord);
		#else
		vec4 metallicRoughnessColor = texture(sampler2D(metallicRoughnessTexture, metallicRoughnessTextureSampler), f_Texcoord);
		#endif
		
		perceptualRoughness = perceptualRoughness * metallicRoughnessColor.g;
		metallic  = metallic  * metallicRoughnessColor.b;
	}

	perceptualRoughness = clamp(perceptualRoughness, MIN_ROUGHNESS, 1.0);
	metallic  = clamp(metallic, 0.0, 1.0);

	// ベースカラーの取得. ベースカラーは単純な表面色
	vec4 baseColor;
	if(ubo.useBaseColorTexture != 0)
	{
		#ifdef USE_OPENGL
		baseColor = texture(baseColorTexture, f_Texcoord);
		#else
		baseColor = texture(sampler2D(baseColorTexture, baseColorTextureSampler), f_Texcoord);
		#endif
	}
	else
	{
		baseColor = ubo.baseColorFactor;
	}
	
	vec3 n = getNormal();
	float depth = gl_FragCoord.z;

	gPosition = f_WorldPos;
	gNormal = vec4(n, 1.0);
	gAlbedo = baseColor;
	gDepth = vec4(depth);
}