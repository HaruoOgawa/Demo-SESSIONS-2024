#version 450

layout(location = 0) in vec4 fragPos;

layout(location = 0) out vec4 outColor;

void main() {
    float depth = fragPos.z / fragPos.w;
    depth = depth * 0.5 + 0.5;

    //float depth = gl_FragCoord.z;

    float moment1 = depth;
    float moment2 = depth * depth;

    // ƒ‚[ƒƒ“ƒg‚ğ‹‚ß‚é
    float dx = dFdx(depth);
    float dy = dFdy(depth);
    moment2 += 0.25 * (dx * dx + dy * dy);

    outColor = vec4(moment1, moment2, 0.0, 1.0);
}