#version 450

layout(location = 0) in vec2 fragTexCoord;
layout(location = 1) in vec4 fragColor;

layout(location = 0) out vec4 outColor;

void main() {
    vec3 col = vec3(0.0);
    col = fragColor.rgb;

    outColor = vec4(col, 0.5);
}