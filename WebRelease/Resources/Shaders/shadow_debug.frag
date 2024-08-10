#version 450

layout(location = 0) in vec2 fragTexCoord;

layout(binding = 1) uniform texture2D depthMap;
layout(binding = 2) uniform sampler depthSampler;

layout(location = 0) out vec4 outColor;

void main() {
    float depth = texture(sampler2D(depthMap, depthSampler), vec2(fragTexCoord.x, 1.0 - fragTexCoord.y)).r;
    outColor = vec4(vec3(depth), 1.0);
}