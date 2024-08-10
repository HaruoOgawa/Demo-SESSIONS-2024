#version 450

layout(location = 0) in vec3 fWolrdNormal;
layout(location = 1) in vec2 fUV;
layout(location = 2) in vec3 fViewDir;

layout(binding = 1) uniform FragBufferObject_0{
	int useDirSampling;
	float time;
	int useTexColor;
	int useColor;

	vec4 baseColor;

	mat4 mPad0;
	mat4 mPad1;
	mat4 mPad2;
	mat4 mPad3;
} fbo_0;

#ifdef USE_OPENGL
layout(binding = 2) uniform sampler2D texImage;
#else
layout(binding = 2) uniform texture2D texImage;
layout(binding = 3) uniform sampler texSampler;
#endif

layout(location = 0) out vec4 outColor;

void main()
{
	vec4 col = vec4(1.0); 
	vec2 st = fUV;

	if(fbo_0.useTexColor != 0)
	{
		if(fbo_0.useDirSampling != 0)
		{
			float pi = 3.1415;

			float theta = acos(fViewDir.y);
			float phi = atan(fViewDir.z, fViewDir.x);

			st = vec2(phi / (2.0 * pi), theta / pi);
		}

		#ifdef USE_OPENGL
		col.rgb = texture(texImage, st).rgb;
		#else
		col.rgb = texture(sampler2D(texImage, texSampler), st).rgb;
		#endif
	}
	else if(fbo_0.useColor != 0)
	{
		col = fbo_0.baseColor;
	}	

	outColor = col;
}