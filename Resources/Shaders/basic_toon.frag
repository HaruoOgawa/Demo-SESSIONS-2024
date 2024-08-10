#version 450

layout(location = 0) in vec3 f_WorldNormal;
layout(location = 1) in vec2 f_Texcoord;
layout(location = 2) in vec4 f_WorldPos;
layout(location = 3) in vec3 f_WorldTangent;
layout(location = 4) in vec3 f_WorldBioTangent;
layout(location = 5) in vec4 f_LightSpacePos;
layout(location = 6) in vec2 f_SphereUV;

layout(location = 0) out vec4 outColor;

layout(binding = 2) uniform FragUniformBufferObject{
	vec4 lightDir;
	vec4 lightColor;
	vec4 cameraPos;
	vec4 diffuseFactor;

	vec4 ambientFactor;
	vec4 specularFactor;
	vec4 edgeColor;

	float specularIntensity;
	float f_pad0;
	float f_pad1;
	float f_pad2;

    int UseMainTexture;
    int UseToonTexture;
	int UseSphereTexture;
	int SphereMode;

	int drawPathIndex;
	int iPad0;
	int iPad1;
	int iPad2;

	mat4 mPad0;
	mat4 mPad1;
	mat4 mPad2;
	mat4 mPad3;
} fragUbo;

#ifdef USE_OPENGL
layout(binding = 3) uniform sampler2D MainTexture;
layout(binding = 5) uniform sampler2D ToonTexture;
layout(binding = 7) uniform sampler2D SphereTexture;
#else
layout(binding = 3) uniform texture2D MainTexture;
layout(binding = 4) uniform sampler MainTextureSampler;
layout(binding = 5) uniform texture2D ToonTexture;
layout(binding = 6) uniform sampler ToonTextureSampler;
layout(binding = 7) uniform texture2D SphereTexture;
layout(binding = 8) uniform sampler SphereTextureSampler;
#endif

void main(){
	vec3 col = vec3(1.0);
	float alpha = 1.0;

	if(fragUbo.drawPathIndex == 1) // 通常描画パス
	{
		// Lighting Param
		float NdotL = max(0.0, dot(f_WorldNormal, -fragUbo.lightDir.xyz));

		vec3 v = normalize(fragUbo.cameraPos.xyz - f_WorldPos.xyz);
		vec3 l = (-1.0) * fragUbo.lightDir.xyz;
		vec3 HalfVector = normalize(v + l);

		// Diffuse
		vec4 diffuseColor = fragUbo.diffuseFactor;

		// Ambient
		if(fragUbo.UseToonTexture == 0)
		{
			//diffuseColor.rgb +=  fragUbo.ambientFactor.rgb * max(dot(-fragUbo.lightDir.xyz, f_WorldNormal), 0.0);
		}

		// MainTexture
		if(fragUbo.UseMainTexture != 0)
		{
			#ifdef USE_OPENGL
			vec4 MainColor = texture(MainTexture, f_Texcoord);
			#else
			vec4 MainColor = texture(sampler2D(MainTexture, MainTextureSampler), f_Texcoord);
			#endif
	
			diffuseColor *= MainColor;
		}

		col = diffuseColor.rgb;
		alpha = diffuseColor.a;

		// SphereMap
		if(fragUbo.UseSphereTexture != 0)
		{
			#ifdef USE_OPENGL
			vec3 SphereColor = texture(SphereTexture, f_SphereUV).rgb;
			#else
			vec3 SphereColor = texture(sampler2D(SphereTexture, SphereTextureSampler), f_SphereUV).rgb;
			#endif

			if(fragUbo.SphereMode == 1) // 乗算
			{
				col *= SphereColor;		
			}
			else if(fragUbo.SphereMode == 2) // 加算
			{
				col += SphereColor;
			}
		}

		// Toon
		if(fragUbo.UseToonTexture != 0)
		{
			#ifdef USE_OPENGL
			vec3 ToonColor = texture(ToonTexture, vec2(0.0, NdotL)).rgb;
			#else
			vec3 ToonColor = texture(sampler2D(ToonTexture, ToonTextureSampler), vec2(0.0, NdotL)).rgb;
			#endif 

			col *= mix(ToonColor, vec3(1.0), clamp(NdotL * 16.0 + 0.5, 0.0, 1.0));
		}

		// Specular
		if(fragUbo.specularIntensity > 0.0)
		{
			vec3 specularColor = fragUbo.specularFactor.xyz * pow(max(0.0, dot(HalfVector, f_WorldNormal)), fragUbo.specularIntensity);
			col += specularColor;
		}
	}
	else if(fragUbo.drawPathIndex == 2) // アウトライン描画パス
	{
		col.rgb = fragUbo.edgeColor.rgb;
	}
	
	outColor = vec4(col, alpha);
}