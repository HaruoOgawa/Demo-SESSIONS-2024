#version 450

layout(location = 0) in vec3 f_WorldNormal;
layout(location = 1) in vec2 f_Texcoord;
layout(location = 2) in vec4 f_WorldPos;
layout(location = 3) in vec3 f_WorldTangent;
layout(location = 4) in vec3 f_WorldBioTangent;
layout(location = 5) in vec4 f_LightSpacePos;

layout(location = 0) out vec4 outColor;

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
    // MipCount�ɂ͔��˃L���[�u�}�b�v��IBL��SpecularMap�̒l�������Ă���(�����͕K���ǂ��炩��������g�p����Ȃ�����)
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

// �Ȃ�UnityPBR�ł��݂��l���Ȃ�
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

// �}�C�N���t�@�Z�b�g(�����ʖ@�����z�֐�)(Microfacet Distribution). Distribution�͕��z�ɈӖ�
// ���z�֐��Ȃ̂œ��v�w�I�ɋ��߂�ꂽ����
// �}�C�N���t�@�Z�b�g�̖ʐς�Ԃ�
// �ʐς��������قǃ}�C�N���t�@�Z�b�g���U��΂��Ă��čr���Ƃ������Ƃ��ȁH �� �傫���قǓʉ��̂Ȃ���̕��ʂɋ߂Â�
// https://learnopengl.com/PBR/Theory#:~:text=GGX%20for%20G.-,Normal%20distribution%20function,-The%20normal%20distribution
float CalcMicrofacet(PBRParam param)
{
	float roughness2 = param.alphaRoughness * param.alphaRoughness; // �O���t�̌��z����������
	
	//
	float f = (param.NdotH * roughness2 - param.NdotH) * param.NdotH + 1.0;
	// = ( param.NdotH * (roughness2 - 1.0) ) * param.NdotH + 1.0
	// = pow(param.NdotH, 2.0) * (roughness2 - 1.0) + 1.0
	// �����Ɠ����`�ɂȂ�. (n�Eh)^2 * (a^2 - 1) + 1
	
	//
	return roughness2 / (PI * f * f);
}

// �􉽌�����(Geometric Occlusion)
// �}�C�N���t�@�Z�b�g�̔������ʂ����̌o�H���Ւf���邱�Ƃɂ�莸���Ă��܂����̌����ʂ��v�Z����֐�
float CalcGeometricOcculusion(PBRParam param)
{
	float NdotL = param.NdotL;
	float NdotV = param.NdotV;
	// �\�ʂ��r���قǁA�������ʂ������Č����B������₷���Ȃ�
	float r = param.alphaRoughness;

	// �ڂ�������(https://google.github.io/filament/Filament.md.html#materialsystem/specularbrdf/geometricshadowing(specularg))
	// �V���h�E�C���O�̍����v�Z(���ˌ������̔������ʂɎՂ��ĉe�ɂȂ�����������镪)
	float attenuationL = 2.0 * NdotL / ( NdotL + sqrt(r * r + (1.0 - r * r) * (NdotL * NdotL)) );
	// = 2.0 * NdotL / ( NdotL * () )
	// �}�X�L���O�̍����v�Z(���ˌ������̔������ʂɎՂ��Ă��̌����ڂɓ͂��Ȃ����ƂŌ������镪)
	float attenuationV = 2.0 * NdotV / ( NdotV + sqrt(r * r + (1.0 - r * r) * (NdotV * NdotV)) );

	// �􉽌������͏�L�̏�Z����
	return attenuationL * attenuationV;
}

// �t���l������(�t���l����). 
// �t���l�����˂Ƃ�View�����ɉ����Ĕ��˗����ω����镨�����ۂ̂��Ƃł��� 
// �����ł�GGX���ł̃t���l�����˂̓I�u�W�F�N�g�̒[�ł���قǔ��˗�������(���ːF�����邢)���Ƃ������Ă���
// https://marmoset.co/posts/basic-theory-of-physically-based-rendering/
// ���̉摜���킩��₷�� --> https://marmoset.co/wp-content/uploads/2016/11/pbr_theory_fresnel.png
// GGX�̃t���l�����̎��́A�悭���w�̕���Ō���������悤�ȃt���l���̎��̋ߎ����ł���(https://ja.wikipedia.org/wiki/%E3%83%95%E3%83%AC%E3%83%8D%E3%83%AB%E3%81%AE%E5%BC%8F)
// https://learnopengl.com/PBR/Theory#:~:text=return%20ggx1%20*%20ggx2%3B%0A%7D-,Fresnel%20equation,-The%20Fresnel%20equation
vec3 CalcFrenelReflection(PBRParam param)
{
	// ��{�̔��˗�: reflectance0
	// ����ɑ΂��Ď�������ɂ�锽�˗��̕ω��������Z���Ă���
	// ���Ɛ�������reflectance90��1.0�Ȃ̂ō��͂���܂�[���l���Ȃ��Ă����������H
	// ����������reflectance90�͔}���̋��ܗ��Ɋ֌W���Ă���H�^�󂾂�1.0�Ȃ̂ŁA���̐����Ƃ����ƂЂƂ܂��^��Ɖ��肵�Ă���H
	return param.reflectance0 + (param.reflectance90 - param.reflectance0) * pow(clamp(1.0 - param.VdotH, 0.0, 1.0), 5.0);
}

// �f�B�t���[�Y��BRDF���v�Z
// https://google.github.io/filament/Filament.md.html#materialsystem/diffusebrdf
// ���̋L���ɂ��Ɗg�U�F��BRDF�͋ߎ��I�Ɂw1.0 / PI�x�ƒ�܂�Ƃ̂���
vec3 CalcDiffuseBRDF(PBRParam param)
{
	return param.diffuseColor / PI;
}

// �@���̎擾(�m�[�}���}�b�v���g�����Ƃ�����. �� ���łɕ׋�����)
vec3 getNormal()
{
	vec3 nomral = vec3(0.0);

	if(ubo.useNormalTexture != 0)
	{
		// Tangent, SubTangent, Normal�ō\���������W�ϊ��x�N�g�����쐬����
		// ���̂悤�ȕϊ��s��̂��Ƃ𓪕������Ƃ��� TBN Matrix �ƌĂ�
		// �@���}�b�v�̎����@�������͏�ɒ萔�ł���A�I�u�W�F�N�g����]������ƃ��[���h���W��̌���������Ȃ��Ȃ�̂ŁA���W�ϊ����Đ��������̂ɂ���K�v������
		// �Ⴆ��Z�����������@���}�b�v������Plane�I�u�W�F�N�g��X�������90�x��]������ƁA�@��������Y�����ɂȂ�̂��������͂��Ȃ̂ɁA�@���}�b�v�̒l���萔�ł��邽�߁A
		// ���̂܂�Z�������������C�e�B���O���������Ȃ��ƂɂȂ�
		// https://learnopengl.com/Advanced-Lighting/Normal-Mapping#:~:text=tangent%20space.-,Tangent%20space,-Normal%20vectors%20in
		// TBN Matrix�̌v�Z��@
		// �@���͗ǂ��Ȃ�.
		// �ړ_�ƕ��ڐ��̃x�N�g���������T�[�t�F�C�X�̃e�N�X�`�����W�̕����ƈ�v���Ă���Ƃ������Ƃ𗘗p���Čv�Z����(��L�̐ڐ���Ԃ̍��ڂ��)
		// �O�p�`�̒��_�Ƃ��̃e�N�X�`�����W����ڐ��ƕ��ڐ����v�Z���邱�Ƃ��ł���
		// �� ����̓��������ڐ���ԋL����E1�EE2���\���͖̂ʐςł͂Ȃ��AP1�EP2�EP3���g�����w�x�N�g���x
		// �� �Ȃ̂Ńx�N�g���ŎO�p�`������Όv�Z�͂ł���̂ŁA����Plane�ł͂Ȃ��|���S���P�ʂŐڐ��̌v�Z���s�����Ƃ��ł���
		// Shader�x�[�X�̒��_�Z�o�̓p�t�H�[�}���X�����̂ŁA�ЂƂ܂��v�Z��CPU�ōs���Ă���
		// �����͂���(https://drive.google.com/file/d/1A4WK5GLRzWRD9yt9_yxSjyz8Yrmb5Is8/view?usp=sharing)

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

// Lenear�͌��w�ɑ������F���(�����̌��̎d�g��
// sRGB�̓��j�^�[�Ɏg����F��ԂŐl�Ԃ̐F�̒m�o�ɑ����Ă���
// Linear���sRGB�̕������邢
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

	// �}�b�n�o���h�΍��Shadow Bias
	// ShadowBias�Ƃ͐[�x�̃I�t�Z�b�g�̂���
	// �}�b�n�o���h��ShawMap�̉𑜓x�ɂ�蔭������B�����̃t���O�����g�����������r�I����Ă���ꍇ�A�[�x�}�b�v���瓯���l���T���v�����O����\��������B
	// ���̓��ˊp���I�N���[�_�[�̖@���ɑ΂��Ď΂߂ȂƂ��A��L�̗��R����Ⴆ�Ώ����[�x���傫���ׂ̕\�ʂ̐[�x���T���v�����O���Ă��܂��A����ShadowMap�̌��̐[�x���傫���Ȃ��Ă��܂����ƂŎȁX�ɂȂ�(�傫���Ƃ������Ƃ͉e�ɂȂ�, ���F)
	// ���̑΍�ŃI�N���[�_�[���ق�̏���������O�ɂ���B��O�ɂ��邱�Ƃ�Shadowmap�����[�x���������Ȃ邽�߉e�ɂȂ�ɂ����Ȃ�
	// https://drive.google.com/file/d/1tyDT7xQVSYzKnZXt6vvDwt-rlWEjVGDP/view?usp=sharing
	// ���̖@���ƃ��C�g�����̐����p�x�������ɂȂ�قǁABias����������
	// https://learnopengl.com/Advanced-Lighting/Shadows/Shadow-Mapping
	float ShadowBias = max(0.005, 0.05 * (1.0 - dot(nomral, lightDir)) );

	float distance = lsp.z - ShadowBias;

	// ShadowMap�̐[�x������O�Ȃ̂ŕ��ʂɕ`�悷��
	if((distance) <= moments.x)
	{
		return 1.0;
	}
	
	// ���Ȃ̂ŉe�ɂ���
	// �o���A���X�̌v�Z
	float variance = moments.y - (moments.x * moments.x);
	variance = max(0.005, variance);

	float d = distance - moments.x;
	float p_max = variance / (variance + d * d);

	// �{���e�ɂȂ�Ƃ���Ɍ����ɂ���ł���悤�ȃA�[�e�B�t�@�N�g���o�邱�Ƃ�����̂ł��̑΍�
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
	// ���˃J���[���v�Z
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

	// �e�N�X�`���v�Z
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

float CalcDepth(vec3 p)
{
	vec4 fragPos = ubo.proj * ubo.view * vec4(p, 1.0);

    float depth = fragPos.z / fragPos.w;
    depth = depth * 0.5 + 0.5;

    float moment1 = depth;
    float moment2 = depth * depth;

    float dx = dFdx(depth);
    float dy = dFdy(depth);
    moment2 += 0.25 * (dx * dx + dy * dy);

	return moment2;
}

void main(){
	vec4 col = vec4(1.0);

	// ���t�l�X�ƃ��^���b�N���擾�B�e�N�X�`���Ƀp�b�L���O����Ă��邱�Ƃ�����
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

	// ���ۂɌv�Z�Ɏg�p���郉�t�l�X����
	float alphaRoughness = perceptualRoughness * perceptualRoughness;

	// �x�[�X�J���[�̎擾. �x�[�X�J���[�͒P���ȕ\�ʐF
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
	
	// 
	vec3 f0 = vec3(0.04);
	// diffuseColor. �󂷂Ɗg�U�F. ���C�g�ŏƂ炳�ꂽ�Ƃ��ɂ��̕��̂����˂���F. ���w�I�ɂ͔��˂��Ėڂɓ���F
	// https://help.autodesk.com/view/3DSMAX/2023/ENU/?guid=GUID-3CEBFC6A-7A8F-4E78-9CF2-F78BA9CFCDC3
	// ���Ԃ񂱂�0.04�Ƃ������l�͌o�����瓾��ꂽ�l�ŕ����w�҂����������Ƀ`���[�j���O���ē����Y��ȕ`�挋�ʂ��o���̂ɂ��傤�ǂ����l�Ƃ������Ƃ��Ǝv��
	// �� ����ɒ��ׂĂ݂�Ƃ���0.04�͓��˔��˗�4%�Ƃ����Ӗ��炵���A���Ԃ�ǂ�ȕ��̂ł��Œ�ł�4%�͔��˂���Ƃ������ƂȂ̂�������Ȃ�
	vec3 diffuseColor = baseColor.rgb * (vec3(1.0) - f0); // 0.04��������������. ���Ԃ���G�l���M�[���F�ȊO�̂Ƃ��Ō������������l�����Ă���(?)
	diffuseColor *= (1.0 - metallic); // metallic��1.0�Ȃ�diffuseColor��0�ɂȂ�B���S�ȋ����̕\�ʐF�͎���̉f�荞�ݐF�����ɂȂ邱�Ƃ�\���Ă���
	// specularColor. �Ӗ��͋��ʐF. �T�[�t�F�C�X��̃n�C���C�g�̐F�炵��.
	// https://help.autodesk.com/view/3DSMAX/2023/ENU/?guid=GUID-90065A74-C223-474C-8D85-7596D70E5004
	// �����ł���قǃn�C���C�g�F���x�[�X�J���[�ɋ߂Â�.
	// �Ƃ͂����m���ɋ����͂�����Ƃ��Ăċt�Ƀ}�b�g�ȃI�u�W�F�N�g�͑S�������ĂȂ��悤�ȃC���[�W������
	// metallic : 0.0(�}�b�g) <--> 1.0(����) ���ĈӖ����Ǝv��
	vec3 specularColor = mix(f0, baseColor.rgb, metallic); // specularColor

	// ���˗�(reflectance)�̌v�Z
	// �n�C���C�g�J���[��RGB����ԑ傫����̐F�ɂȂ�̂ŁA�ǂꂭ�炢���˂��邩�����̒l(�F)����ɂ���͂��ł���
	float reflectance = max(max(specularColor.r, specularColor.g), specularColor.b);

	// �t���l�����ŕK�v�ȃp�����[�^�[
	// reflectance�ɑ΂���0.04(4%) * 25.0 = 1.0(100%)�Ƃ������v�Z���s���A0.04(4%)�ȏ�͋����I��1.0(100%)�ɁA�����艺�̒l��0.0 ~ 1.0�̕��z������Ă���B�܂�O���t���}���z�ɂ��Ă���
	float reflectance90 = clamp(reflectance * 25.0, 0.0, 1.0);
	vec3 specularEnvironmentR0 = specularColor.rgb; // �ʏ�̔��˗�
	vec3 specularEnvironmentR90 = vec3(1.0, 1.0, 1.0) * reflectance90; // �}���z�Δ��˗�

	// PBR�Ɏg���x�N�g���n�̃p�����[�^�[���v�Z����
	vec3 n = getNormal();
	vec3 v = (-1.0f) * normalize(f_WorldPos.xyz - ubo.cameraPos.xyz);
	
	// �v�Z�Ɏg�p����̂Ń��C�g�����͔��]�����Ă���
	// �}�������Ƃ킩�邪���̂܂܂̃x�N�g�����g����180�x��]�������̌��ʂɂȂ��Ă��܂�
	// �@����������ɍl����
	vec3 l = (-1.0f) * normalize(ubo.lightDir.xyz);
	
	// �n�[�t�x�N�g����v��l�̒��ԂɈʒu����x�N�g���̂���
	// �����̕����x�N�g����CG�̊���Ƃ��Č��������Ɍ��������������̂����H
	// https://qiita.com/emadurandal/items/76348ad118c36317ec5c#:~:text=%E3%81%97%E3%81%A6%E3%81%84%E3%81%BE%E3%81%99%E3%80%82-,h,%E3%81%AF%E3%83%8F%E3%83%BC%E3%83%95%E3%83%99%E3%82%AF%E3%83%88%E3%83%AB%E3%81%A8%E3%81%84%E3%81%84,-%E3%80%81%E3%83%A9%E3%82%A4%E3%83%88%E3%83%99%E3%82%AF%E3%83%88%E3%83%AB%E3%81%A8
	vec3 h = normalize(v + l);
	vec3 reflection = normalize(reflect(v, n));

	// �l�����Ƃ��Ă͓��ς͓�̃x�N�g���̊p�x���ǂꂾ�������E�����ɋ߂����������l�Ƃ��Ă݂邱�Ƃ��ł���
	float NdotL = clamp(dot(n, l), 0.0, 1.0);
	float NdotV = clamp(abs(dot(n, v)), 0.0, 1.0);
	float NdotH = clamp(dot(n, h), 0.0, 1.0);
	float LdotH = clamp(dot(l, h), 0.0, 1.0);
	float VdotH = clamp(dot(v, h), 0.0, 1.0);

	//
	PBRParam pbrParam = PBRParam(
		NdotL,
		NdotV,
		NdotH,
		LdotH,
		VdotH,
		perceptualRoughness,
		metallic,
		specularEnvironmentR0,
		specularEnvironmentR90,
		alphaRoughness,
		diffuseColor,
		specularColor
	);

	//
	vec3 specular = vec3(0.0);
	vec3 diffuse = vec3(0.0);

	// �N�b�N�g�����X���f���ɂ��X�y�L�����[��GGX���v�Z����
	float D = CalcMicrofacet(pbrParam); // �}�C�N���t�@�Z�b�g(�����ʖ@�����z�֐�)
	float G = CalcGeometricOcculusion(pbrParam); // �􉽌�����
	vec3 F = CalcFrenelReflection(pbrParam); // �t���l����

	if(NdotL > 0.0 || NdotV > 0.0)
	{
		// �X�y�L�����[BRDF���\�z
		// �X�y�L�����[�͋��ʔ���: ���ʔ��˂Ƃ͓��ˊp�Əo�ˊp������������
		// https://ja.wikipedia.org/wiki/%E9%8F%A1%E9%9D%A2%E5%8F%8D%E5%B0%84
		specular += D * G * F / (4.0 * NdotL * NdotV);

		specular = max(specular, vec3(0.0));

		// �f�B�t���[�YBRDF���v�Z
		// Diffuse�͊g�U���� : �g�U���˂Ƃ͋��ʔ��˂ɔ�ׂĔ��ˊp�Ɉˑ������A���l�ȕ����ɓ����x�̌��x������˂̂���
		// https://ja.wikipedia.org/wiki/%E6%8B%A1%E6%95%A3%E5%8F%8D%E5%B0%84
		diffuse += (1.0 - F) * CalcDiffuseBRDF(pbrParam);

		// �����_�����O���������\�z
		col.rgb = NdotL * (specular + diffuse);
	}

	// �悭�킩��񂪁Aif����2��l�X�g�ɂȂ��Ă����ComputeIBL�������Ȃ��̂łЂƂ܂�if���̊O�ɒu���Ă���
	if(ubo.useIBL != 0)
	{
		// IBL
		col.rgb += ComputeIBL(pbrParam, v, n);
	}
	else
	{
		// ���˃J���[���v�Z
		col.rgb += ComputeReflectionColor(pbrParam, v, n) * F;

		// �^���I�Ȋ���(���C�g�̔��Ε������Â��Ȃ肷���Ȃ��悤�ɂ��邽�߂̑΍�)
		// �{����GI��IBL�ő�p����Ƃ��낾���A�ЂƂ܂����̂悤�ȊȈՓI�ȕ��@�ő�p
		// GI��IBL���g�p����Ƃ��̓v���v���Z�b�T�ł����͎��s����Ȃ��悤�ɂ���
		// (Cubemap���O�����Ƃ��A���ꂪ�Ȃ��Ɛ^���ÂɂȂ�)
		// https://cgworld.jp/terms/%E3%82%A2%E3%83%B3%E3%83%93%E3%82%A8%E3%83%B3%E3%83%88.html
		vec3 gi_diffuse = clamp(specular, 0.04, 1.0);
		col.rgb += gi_diffuse * diffuse;
	}

	// AO Map�̓K��
	if(ubo.useOcclusionTexture != 0)
	{ 
		#ifdef USE_OPENGL
		float ao = texture(occlusionTexture, f_Texcoord).r;
		#else
		float ao = texture(sampler2D(occlusionTexture, occlusionTextureSampler), f_Texcoord).r;
		#endif
		
		col.rgb = mix(col.rgb, col.rgb * ao, ubo.occlusionStrength);
	}

	// Emissive Map�̓K��
	if(ubo.useEmissiveTexture != 0)
	{
		#ifdef USE_OPENGL
		vec3 emissive = SRGBtoLINEAR(texture(emissiveTexture, f_Texcoord)).rgb * ubo.emissiveFactor.rgb;
		#else
		vec3 emissive = SRGBtoLINEAR(texture(sampler2D(emissiveTexture, emissiveTextureSampler), f_Texcoord)).rgb * ubo.emissiveFactor.rgb;
		#endif
		
		col.rgb += emissive;
	}

	// Shadow
	// LightSpaceScreenPos
	if(ubo.useShadowMap != 0)
	{
		vec3 lsp = f_LightSpacePos.xyz / f_LightSpacePos.w;
		lsp = lsp * 0.5 + 0.5;
		float shadowCol = 1.0;

		//bool outSide = f_LightSpacePos.z <= 0.0f || (lsp.x < 0 || lsp.y < 0) || (lsp.x > 1 || lsp.y > 1);

		//if(!outSide)
		{
			shadowCol = CalcShadow(lsp, n, l);
		}

		col.rgb *= shadowCol;
	}

	// �J���[�X�y�[�X�����j�A�ɂ���
	col.rgb = pow(col.rgb, vec3(1.0/2.2));

	// �A���t�@���w��
	col.a = baseColor.a;

	outColor = col;

	gl_FragDepth = CalcDepth(f_WorldPos.xyz);
}