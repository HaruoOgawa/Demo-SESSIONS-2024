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

layout(location = 0) out vec2 fragTexCoord;

void main() {
    mat4 mvmat = ubo.view * ubo.model;

    mvmat[0][0] = 5.0;
    mvmat[0][1] = 0.0;
    mvmat[0][2] = 0.0;

    mvmat[1][0] = 0.0;
    mvmat[1][1] = 5.0;
    mvmat[1][2] = 0.0;

    mvmat[2][0] = 0.0;
    mvmat[2][1] = 0.0;
    mvmat[2][2] = 5.0;

    gl_Position = ubo.proj * mvmat * vec4(inPosition, 1.0);
    fragTexCoord = inTexcoord;
}