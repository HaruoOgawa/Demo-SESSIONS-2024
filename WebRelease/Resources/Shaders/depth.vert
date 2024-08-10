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
} ubo;

layout(location = 0) out vec4 fragPos;

void main() {
    gl_Position = ubo.lightVPMat * ubo.model * vec4(inPosition, 1.0);
    fragPos = gl_Position;
}