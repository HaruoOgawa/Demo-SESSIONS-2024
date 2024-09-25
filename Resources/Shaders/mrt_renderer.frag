#version 450

layout(location = 0) in vec2 fUV;

layout(binding = 0) uniform UniformBufferObject{
	mat4 model;
    mat4 view;
    mat4 proj;
	mat4 lightVPMat;

	vec4 lightDir;
	vec4 lightPos;
	vec4 lightColor;
	vec4 cameraPos;

	float Attenuation;
	float fPad0;
	float fPad1;
	float fPad2;
} fragUBO;

#ifdef USE_OPENGL
layout(binding = 1) uniform sampler2D texGPosition;
layout(binding = 3) uniform sampler2D texGNormal;
layout(binding = 5) uniform sampler2D texGAlbedo;
layout(binding = 7) uniform sampler2D texDepth;
layout(binding = 9) uniform sampler2D texParam1;
#else
layout(binding = 1) uniform texture2D texGPosition;
layout(binding = 2) uniform sampler texGPositionSampler;
layout(binding = 3) uniform texture2D texGNormal;
layout(binding = 4) uniform sampler texGNormalSampler;
layout(binding = 5) uniform texture2D texGAlbedo;
layout(binding = 6) uniform sampler texGAlbedoSampler;
layout(binding = 7) uniform texture2D texDepth;
layout(binding = 8) uniform sampler texDepthSampler;
layout(binding = 7) uniform texture2D texParam1;
layout(binding = 8) uniform sampler texParam1Sampler;
#endif

layout(location = 0) out vec4 outColor;

struct Light
{
	vec3 Posision;
	vec3 Color;
};

// PBR Shader////////////////////////////////////
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

float CalcMicrofacet(PBRParam param)
{
	float roughness2 = param.alphaRoughness * param.alphaRoughness; 
	
	float f = (param.NdotH * roughness2 - param.NdotH) * param.NdotH + 1.0;
	return roughness2 / (PI * f * f);
}

float CalcGeometricOcculusion(PBRParam param)
{
	float NdotL = param.NdotL;
	float NdotV = param.NdotV;
	float r = param.alphaRoughness;

	float attenuationL = 2.0 * NdotL / ( NdotL + sqrt(r * r + (1.0 - r * r) * (NdotL * NdotL)) );
	float attenuationV = 2.0 * NdotV / ( NdotV + sqrt(r * r + (1.0 - r * r) * (NdotV * NdotV)) );

	return attenuationL * attenuationV;
}

vec3 CalcFrenelReflection(PBRParam param)
{
	return param.reflectance0 + (param.reflectance90 - param.reflectance0) * pow(clamp(1.0 - param.VdotH, 0.0, 1.0), 5.0);
}

vec3 CalcDiffuseBRDF(PBRParam param)
{
	return param.diffuseColor / PI;
}

vec3 DoPBR(vec3 Albedo, vec3 Normal, vec3 WorldPos, bool UseLightPos, bool UseCameraPos, vec3 lightDir, float Metallic, float Roughness)
{
	vec4 col = vec4(1.0);

	// GBufferから取得する
	float perceptualRoughness = Roughness;
	float metallic = Metallic;

	perceptualRoughness = clamp(perceptualRoughness, MIN_ROUGHNESS, 1.0);
	metallic  = clamp(metallic, 0.0, 1.0);

	float alphaRoughness = perceptualRoughness * perceptualRoughness;

	vec4 baseColor = vec4(Albedo, 1.0);
	
	// 
	vec3 f0 = vec3(0.04);
	vec3 diffuseColor = baseColor.rgb * (vec3(1.0) - f0);
	diffuseColor *= (1.0 - metallic); 
	vec3 specularColor = mix(f0, baseColor.rgb, metallic); // specularColor

	float reflectance = max(max(specularColor.r, specularColor.g), specularColor.b);

	float reflectance90 = clamp(reflectance * 25.0, 0.0, 1.0);
	vec3 specularEnvironmentR0 = specularColor.rgb; 
	vec3 specularEnvironmentR90 = vec3(1.0, 1.0, 1.0) * reflectance90; 

	vec3 n = Normal;
	vec3 v = (-1.0f) * normalize(WorldPos - fragUBO.cameraPos.xyz);
	
	vec3 l = lightDir;
	if(UseLightPos)
	{
		vec3 lightPos = fragUBO.lightPos.xyz;
		// vec3 lightPos = vec3(0.0, 1.0, 0.0);
		l = (-1.0f) * normalize(WorldPos - lightPos);
	}
	
	vec3 h = normalize(v + l);
	vec3 reflection = normalize(reflect(v, n));

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

	//
	float D = CalcMicrofacet(pbrParam); 
	float G = CalcGeometricOcculusion(pbrParam); 
	vec3 F = CalcFrenelReflection(pbrParam);

	if(NdotL > 0.0 || NdotV > 0.0)
	{
		specular += D * G * F / (4.0 * NdotL * NdotV);

		specular = max(specular, vec3(0.0));

		diffuse += (1.0 - F) * CalcDiffuseBRDF(pbrParam);

		col.rgb = NdotL * (specular + diffuse);
	}

	// col.rgb += ComputeReflectionColor(pbrParam, v, n) * F;

	// アンビエントライト
	vec3 gi_diffuse = clamp(specular, 0.04, 1.0);
	col.rgb += gi_diffuse * diffuse;

	col.rgb = pow(col.rgb, vec3(1.0/2.2));

	float Atten = 0.25;

	if(UseLightPos)
	{
		float len = length(WorldPos - fragUBO.lightPos.xyz);
		col.rgb *= exp(-1.0 * len * Atten);
	}
	else if(UseCameraPos)
	{
		float len = length(WorldPos - fragUBO.cameraPos.xyz);
		col.rgb *= exp(-1.0 * len * Atten);
	}

	return col.rgb;
}

//////////////////////////////////////////////

void main()
{
	vec4 col = vec4(0.0, 0.0, 0.0, 1.0); 
	vec2 st = fUV;
	//vec2 st = mod(fUV * 2.0, 1.0);
	vec2 id = floor(fUV * 2.0);

	#ifdef USE_OPENGL
	vec4 GPositionCol = texture(texGPosition, st);
	#else
	vec4 GPositionCol = texture(sampler2D(texGPosition, texGPositionSampler), st);
	#endif

	#ifdef USE_OPENGL
	vec4 GNormalCol = texture(texGNormal, st);
	#else
	vec4 GNormalCol = texture(sampler2D(texGNormal, texGNormalSampler), st);
	#endif

	#ifdef USE_OPENGL
	vec4 GAlbedoCol = texture(texGAlbedo, st);
	#else
	vec4 GAlbedoCol = texture(sampler2D(texGAlbedo, texGAlbedoSampler), st);
	#endif

	#ifdef USE_OPENGL
	vec4 GDepthCol = texture(texDepth, st);
	#else
	vec4 GDepthCol = texture(sampler2D(texDepth, texDepthSampler), st);
	#endif

	// (Material_ID, LightParam, Metallic, Roughness)
    #ifdef USE_OPENGL
	vec4 Param1Col = texture(texParam1, st);
	#else
	vec4 Param1Col = texture(sampler2D(texParam1, texParam1Sampler), st);
	#endif
	
	vec3 Normal = GNormalCol.rgb;
	vec3 Albedo = GAlbedoCol.rgb;
	vec3 WorldPos = GPositionCol.rgb;
	float MatID = floor(Param1Col.r);
	bool UseLightPos = (floor(Param1Col.g) == 1.0);
	bool UseCameraPos = (floor(Param1Col.g) == 2.0);
	float Metallic = Param1Col.b;
	float Roughness = Param1Col.a;

	vec3 lDir = normalize(vec3(1.0, -1.0, 1.0));

	if(MatID == 1.0)
	{
		vec3 diffuse = max(0.0, dot(lDir, Normal)) * Albedo;
		col.rgb += diffuse;
	}
	else if(MatID == 2.0)
	{
		// vec3 lightDir = (-1.0f) * normalize(fragUBO.lightDir.xyz);
		// とりま定数
		vec3 lightDir = (-1.0f) * normalize(vec3(1.0, -1.0, 1.0));

		col.rgb = DoPBR(Albedo, Normal, WorldPos, UseLightPos, UseCameraPos, lightDir, Metallic, Roughness);
	}
	else if(MatID == 3.0)
	{
		for(int i = 0; i < 4; i++)
		{
			vec3 lightDir = vec3((i % 2 == 0)? 1.0 : -1.0 , 1.0, (i % 2 == 0)? 1.0 : -1.0);

			col.rgb += DoPBR(Albedo, Normal, WorldPos, false, false, lightDir, Metallic, Roughness);
		}

		col.rgb *= 0.5;
	}
	else if(MatID == 4.0)
	{
		// Emission
		// あとでBloomで光らせる
		col.rgb = Albedo;
	}

	// col.rgb = GNormalCol.rgb * 0.5 + 0.5;

	outColor = col;
	gl_FragDepth = GDepthCol.r;
}