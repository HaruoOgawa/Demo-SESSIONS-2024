#version 450

layout(location = 0) in vec2 fUV;

#ifdef USE_OPENGL
layout(binding = 1) uniform sampler2D texGPosition;
layout(binding = 3) uniform sampler2D texGNormal;
layout(binding = 5) uniform sampler2D texGAlbedo;
layout(binding = 7) uniform sampler2D texDepth;
#else
layout(binding = 1) uniform texture2D texGPosition;
layout(binding = 2) uniform sampler texGPositionSampler;
layout(binding = 3) uniform texture2D texGNormal;
layout(binding = 4) uniform sampler texGNormalSampler;
layout(binding = 5) uniform texture2D texGAlbedo;
layout(binding = 6) uniform sampler texGAlbedoSampler;
layout(binding = 7) uniform texture2D texDepth;
layout(binding = 8) uniform sampler texDepthSampler;
#endif

layout(location = 0) out vec4 outColor;

struct Light
{
	vec3 Posision;
	vec3 Color;
};

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

	/*if(id.x == 0.0 && id.y == 0.0)
	{
		col = GPositionCol;
	}
	else if(id.x == 0.0 && id.y == 1.0)
	{
		col = GNormalCol;
	}
	else if(id.x == 1.0 && id.y == 1.0)
	{
		col = GAlbedoCol;
	}
	else if(id.x == 1.0 && id.y == 0.0)*/
	{
		const int NUM_OF_LIGHT = 5;
		float width = 3.0;

		Light lightList[NUM_OF_LIGHT];
		lightList[0].Posision = vec3(0.0, 1.0, 0.0);
		lightList[0].Color = vec3(1.0, 1.0, 1.0);
		lightList[1].Posision = vec3(1.0 * width, 1.0, 0.0);
		lightList[1].Color = vec3(1.0, 0.0, 0.0);
		lightList[2].Posision = vec3(-1.0 * width, 1.0, 0.0);
		lightList[2].Color = vec3(0.0, 1.0, 0.0);
		lightList[3].Posision = vec3(-2.0 * width, 1.0, 0.0);
		lightList[3].Color = vec3(0.0, 0.0, 1.0);
		lightList[4].Posision = vec3(-2.0 * width, 1.0, 0.0);
		lightList[4].Color = vec3(1.0, 0.0, 1.0);

		for(int i = 0; i < NUM_OF_LIGHT; i++)
		{
			vec3 lightDir = normalize(lightList[i].Posision - GPositionCol.xyz);
			vec3 diffuse = max(0.0, dot(GNormalCol.xyz, lightDir)) * GAlbedoCol.rgb * lightList[i].Color;

			col.rgb += diffuse;
		}
	}

	outColor = col;
	gl_FragDepth = GDepthCol.r;
}