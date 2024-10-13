#version 450

layout(location = 0) in vec2 fUV;

layout(binding = 1) uniform sampler2D texGPosition;
layout(binding = 3) uniform sampler2D texGNormal;
layout(binding = 5) uniform sampler2D texGAlbedo;
layout(binding = 7) uniform sampler2D texDepth;
layout(binding = 9) uniform sampler2D texParam1;


layout(location = 0) out vec4 gPosition;
layout(location = 1) out vec4 gNormal;
layout(location = 2) out vec4 gAlbedo;
layout(location = 3) out vec4 gDepth;
layout(location = 4) out vec4 gParam_1; 

void main()
{
	vec2 st = fUV;

	// gPosition
	gPosition = texture(texGPosition, st);
	

	// gNormal
	gNormal = texture(texGNormal, st);
	

	// gAlbedo
	gAlbedo = texture(texGAlbedo, st);
	

	// gDepth
	gDepth = texture(texDepth, st);
	

	// gParam_1
	gParam_1 = texture(texParam1, st);
	
}