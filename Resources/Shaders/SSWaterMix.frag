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

layout(binding = 1) uniform sampler2D texGPosition;
layout(binding = 3) uniform sampler2D texGNormal;
layout(binding = 5) uniform sampler2D texGAlbedo;
layout(binding = 7) uniform sampler2D texDepth;
layout(binding = 9) uniform sampler2D texParam1;

layout(binding = 11) uniform sampler2D texSSWGPosition;
layout(binding = 13) uniform sampler2D texSSWGNormal;
layout(binding = 15) uniform sampler2D texSSWGAlbedo;
layout(binding = 17) uniform sampler2D texSSWDepth;
layout(binding = 19) uniform sampler2D texSSWParam1;

layout(binding = 21) uniform sampler2D texMainColor;

layout(location = 0) out vec4 outColor;
layout(location = 1) out vec4 gPosition;
layout(location = 2) out vec4 gNormal;
layout(location = 3) out vec4 gAlbedo;
layout(location = 4) out vec4 gDepth;
layout(location = 5) out vec4 gParam_1; 

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
	 
	vec2 texcoord = fUV;

	// Depth
	vec4 MRTDepth = texture(texDepth, texcoord);
	vec4 SSWDepth = texture(texSSWDepth, texcoord);
	
	if(MRTDepth.r <= SSWDepth.r)
	{
		// MRTの結果をそのまま渡す
		gPosition = texture(texGPosition, texcoord);
		gNormal = texture(texGNormal, texcoord);
		gAlbedo = texture(texGAlbedo, texcoord);
		gDepth = MRTDepth;
		gParam_1 = texture(texParam1, texcoord);
		outColor = texture(texMainColor, texcoord);
	}
	else
	{
		// Waterの描画
		vec4 SSWGPositionCol = texture(texSSWGPosition, texcoord);
		vec4 SSWGNormalCol = texture(texSSWGNormal, texcoord);
		vec4 SSWGAlbedoCol = texture(texSSWGAlbedo, texcoord);
		vec4 SSWParam1Col = texture(texSSWParam1, texcoord);
		
		gPosition = SSWGPositionCol;
		gNormal = SSWGNormalCol;
		gAlbedo = SSWGAlbedoCol;
		gDepth = SSWDepth;
		gParam_1 = SSWParam1Col;

		// Lighting
		vec3 Normal = SSWGNormalCol.rgb;
		vec3 Albedo = SSWGAlbedoCol.rgb;
		vec3 WorldPos = SSWGPositionCol.rgb;
		float MatID = floor(SSWParam1Col.r);
		bool UseLightPos = (floor(SSWParam1Col.g) == 1.0);
		bool UseCameraPos = (floor(SSWParam1Col.g) == 2.0);
		// float Metallic = SSWParam1Col.b;
		float Metallic = 1.0;
		// float Roughness = SSWParam1Col.a;
		float Roughness = 0.0;
		// vec3 lightDir = (-1.0f) * normalize(fragUBO.lightDir.xyz);
		// とりま定数
		vec3 lightDir = (-1.0f) * normalize(vec3(0.0, -1.0, -1.0));

		vec3 col = vec3(0.0);
		if(UseLightPos) col += DoPBR(Albedo, Normal, WorldPos, true, false, lightDir, Metallic, Roughness);
		col += DoPBR(Albedo, Normal, WorldPos, false, UseCameraPos, lightDir, Metallic, Roughness);

		{
			vec3 Pos = SSWGPositionCol.xyz;
			vec3 CameraPos = fragUBO.cameraPos.xyz;

			vec3 ViewVec = normalize(Pos - CameraPos);

			float n1 = 1.0; // 空気の屈折率
			float n2 = 1.33; // 水の屈折率
			vec3 rd = refract(ViewVec, Normal, (n1 / n2));

			// 画面外に出にくくするために屈折ベクトルにバイアスをかける
			// rd = mix(rd, ViewVec, 0.5);
			// rd = mix(ViewVec, rd, step(dot(rd, ViewVec), 0.0)); 
			// rd = mix(rd, ViewVec, step(dot(rd, ViewVec), 0.0)); 

			float MARCH = 24.0;
			float LENGTH = 10.0;

			float rayStepLength = LENGTH / MARCH;
			vec3 rayStep = rd * rayStepLength;

			vec3 ro = Pos;
			
			float threshold = 0.5;

			vec3 RefractCol = vec3(0.0);
			vec2 screenUV = vec2(0.0);

			for(float i = 0.0; i < MARCH; i++)
			{
				ro += rayStep;

				// レイがスクリーン上でどこに存在するか
				vec4 screenRP = fragUBO.proj * fragUBO.view * vec4(ro, 1.0);
				screenUV = (screenRP.xy / screenRP.w) * 0.5 + 0.5;

				// MRTPassから取得する
				vec3 scenePos = texture(texGPosition, screenUV).xyz;

				if(length(scenePos - ro) < threshold)
				{
					RefractCol = texture(texMainColor, screenUV).rgb;
					break;
				}
			}

			if(screenUV.x < 0.0 || screenUV.x > 1.0 || screenUV.y < 0.0 || screenUV.y > 1.0)
			{
				// screenUV = clamp(screenUV, 0.0, 1.0);
				// RefractCol = texture(texMainColor, screenUV).rgb;

				// ViewVecとしてやりなおす
				ro = Pos;
				rd = ViewVec;
				rayStep = rd * rayStepLength;

				for(float i = 0.0; i < MARCH; i++)
				{
					ro += rayStep;

					// レイがスクリーン上でどこに存在するか
					vec4 screenRP = fragUBO.proj * fragUBO.view * vec4(ro, 1.0);
					screenUV = (screenRP.xy / screenRP.w) * 0.5 + 0.5;

					// MRTPassから取得する
					vec3 scenePos = texture(texGPosition, screenUV).xyz;

					if(length(scenePos - ro) < threshold)
					{
						RefractCol = texture(texMainColor, screenUV).rgb;
						break;
					}
				}
			}

			col += RefractCol;

			// col = vec3(screenUV, 0.0);
		}

		outColor = vec4(col, 1.0);
	}
}