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

    vec4 color;

    int useTexture;
    int pad0;
    int pad1;
    int pad2;
} ubo;

readonly layout(std430, binding = 3) buffer SkinMatrixBuffer
{
    mat4 SkinMat[];
} r_SkinMatrixBuffer;

layout(location = 0) out vec3 f_WorldNormal;
layout(location = 1) out vec2 f_Texcoord;
layout(location = 2) out vec4 f_WorldPos;
layout(location = 3) out vec4 f_Color;

#define rot(a) mat2(cos(a), -sin(a), sin(a), cos(a))

void main(){

    gl_Position = ubo.proj * ubo.view * ubo.model * r_SkinMatrixBuffer.SkinMat[0] * vec4(inPosition, 1.0);
    f_WorldNormal = (ubo.model * vec4(inNormal, 0.0)).xyz;
    f_Texcoord = inTexcoord;
    f_WorldPos = ubo.model * vec4(inPosition, 1.0);
    f_Color = ubo.color;
}