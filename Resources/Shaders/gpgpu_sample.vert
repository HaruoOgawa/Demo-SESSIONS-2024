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

struct TestData
{
    vec4 offset;
    vec4 color;
    float AccumulateDeltaTime;
    float pad0;
    float pad1;
    float pad2;
};

readonly layout(std430, binding = 1) buffer TestBufferObject
{
    TestData data[];
} r_TBO;

layout(location = 0) out vec2 fragTexCoord;
layout(location = 1) out vec4 fragColor;

float rand(vec2 st)
{
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
#ifdef USE_OPENGL
    int id = gl_InstanceID;
#else
    int id = gl_InstanceIndex;
#endif
    vec3 offset = r_TBO.data[id].offset.xyz;

    gl_Position = ubo.proj * ubo.view * ubo.model * vec4(inPosition + offset, 1.0);
    fragTexCoord = inTexcoord;
    fragColor = r_TBO.data[id].color;
}