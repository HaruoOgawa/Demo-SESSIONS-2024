#version 450

layout(location = 0) in vec3 inPosition;
layout(location = 1) in vec3 inNormal;
layout(location = 2) in vec2 inTexcoord;
layout(location = 3) in vec4 inTangent;
layout(location = 4) in uvec4 inBone0;
layout(location = 5) in vec4 inWeights0;

layout(binding = 0) uniform UniformBufferObject{
	mat4 model;
    mat4 view;
    mat4 proj;
	mat4 lightVPMat;

    float edgeSize;
    float fPad0;
    float fPad1;
    float fPad2;

    int useSkinMeshAnimation;
    int pad0;
    int drawPathIndex;
    int pad1;
} ubo;

layout(binding = 1) uniform SkinMatrixBuffer
{
    mat4 SkinMat[512];
} r_SkinMatrixBuffer;

layout(location = 0) out vec3 f_WorldNormal;
layout(location = 1) out vec2 f_Texcoord;
layout(location = 2) out vec4 f_WorldPos;
layout(location = 3) out vec3 f_WorldTangent;
layout(location = 4) out vec3 f_WorldBioTangent;
layout(location = 5) out vec4 f_LightSpacePos;
layout(location = 6) out vec2 f_SphereUV;

#define rot(a) mat2(cos(a), -sin(a), sin(a), cos(a))

void main(){
    vec3 BioTangent = cross(inNormal, inTangent.xyz);

    vec4 WorldPos;
    vec3 WorldNormal;
    vec3 WorldTangent;
    vec3 WorldBioTangent;

    vec3 LocalPos = inPosition;

    // スキンメッシュアニメーション
    if(ubo.useSkinMeshAnimation != 0)
    {
        mat4 SkinMat =
            inWeights0.x * r_SkinMatrixBuffer.SkinMat[inBone0.x] +
            inWeights0.y * r_SkinMatrixBuffer.SkinMat[inBone0.y] +
            inWeights0.z * r_SkinMatrixBuffer.SkinMat[inBone0.z] +
            inWeights0.w * r_SkinMatrixBuffer.SkinMat[inBone0.w] 
        ;

        // スキンメッシュアニメーションの時はubo.modelは乗算しないように注意
        WorldPos = SkinMat * vec4(LocalPos, 1.0);
        WorldNormal = normalize((SkinMat * vec4(inNormal, 0.0)).xyz);
        WorldTangent = normalize((SkinMat * inTangent).xyz);
        WorldBioTangent = normalize((SkinMat * vec4(BioTangent, 0.0)).xyz);
    }
    else
    {
        // 通常の描画
        WorldPos = ubo.model * vec4(LocalPos, 1.0);
        WorldNormal = normalize((ubo.model * vec4(inNormal, 0.0)).xyz);
        WorldTangent = normalize((ubo.model * inTangent).xyz);
        WorldBioTangent = normalize((ubo.model * vec4(BioTangent, 0.0)).xyz);
    }

    // SphereUV
    vec4 VNormal = ubo.view * vec4(WorldNormal, 0.0);
    vec2 SphereUV = VNormal.xy * 0.5 + 0.5;

    // Pos
    if(ubo.drawPathIndex == 2) // アウトライン描画パス
    {
        bool ViewSpaceOutline = false;

        if(ViewSpaceOutline)
        {
            vec4 CameraPos = ubo.view * WorldPos;
            vec3 CameraNormal = (ubo.view * vec4(WorldNormal, 0.0)).xyz;

            CameraPos.xy += normalize(CameraNormal).xy * ubo.edgeSize * 0.001;

            gl_Position = ubo.proj * CameraPos;
        }
        else
        {
            WorldPos.xyz += normalize(WorldNormal) * ubo.edgeSize * 0.001;

            gl_Position = ubo.proj * ubo.view * WorldPos;
        }
    }
    else
    {
        gl_Position = ubo.proj * ubo.view * WorldPos;
    }

    //
    f_WorldNormal = WorldNormal;
    f_Texcoord = inTexcoord;
    f_WorldPos = WorldPos;
    f_WorldTangent = WorldTangent;
    f_WorldBioTangent = WorldBioTangent;
    f_LightSpacePos = ubo.lightVPMat * WorldPos;
    f_SphereUV = SphereUV;
}