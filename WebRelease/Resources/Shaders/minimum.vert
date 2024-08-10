#version 450

layout(location = 0) in vec3 inPosition;
layout(location = 1) in vec3 inNormal;
layout(location = 2) in vec2 inTexcoord;
layout(location = 3) in vec4 inTangent;
layout(location = 4) in uvec4 inJoint0;
layout(location = 5) in vec4 inWeights0;

layout(binding = 0) uniform UniformBufferObject{
	mat4 model;
    mat4 view;
    mat4 proj;
	mat4 lightVPMat;

	vec4 cameraPos;
} ubo;

layout(location = 0) out vec3 fWolrdNormal;
layout(location = 1) out vec2 fUV;
layout(location = 2) out vec3 fViewDir;

void main()
{
	gl_Position = ubo.proj * ubo.view * ubo.model * vec4(inPosition, 1.0);
	fWolrdNormal = (ubo.model * vec4(inNormal, 0.0)).xyz;
	fUV = inTexcoord;
	fViewDir = normalize((ubo.model * vec4(inPosition, 1.0)).xyz - ubo.cameraPos.xyz);
}