struct UniformBufferObject {
    model: mat4x4<f32>,
    view: mat4x4<f32>,
    proj: mat4x4<f32>,
    lightVPMat: mat4x4<f32>,
    lightDir: vec4<f32>,
    lightColor: vec4<f32>,
    cameraPos: vec4<f32>,
    baseColorFactor: vec4<f32>,
    emissiveFactor: vec4<f32>,
    time: f32,
    metallicFactor: f32,
    roughnessFactor: f32,
    normalMapScale: f32,
    occlusionStrength: f32,
    mipCount: f32,
    ShadowMapX: f32,
    ShadowMapY: f32,
    useBaseColorTexture: i32,
    useMetallicRoughnessTexture: i32,
    useEmissiveTexture: i32,
    useNormalTexture: i32,
    useOcclusionTexture: i32,
    useCubeMap: i32,
    useShadowMap: i32,
    useIBL: i32,
    useSkinMeshAnimation: i32,
    useDirCubemap: i32,
    pad1_: i32,
    pad2_: i32,
}

struct SkinMatrixBuffer {
    SkinMat: array<mat4x4<f32>,512u>,
}

struct gl_PerVertex {
    @builtin(position) gl_Position: vec4<f32>,
    gl_PointSize: f32,
    gl_ClipDistance: array<f32,1u>,
    gl_CullDistance: array<f32,1u>,
}

struct VertexOutput {
    @builtin(position) gl_Position: vec4<f32>,
    @location(0) member: vec3<f32>,
    @location(1) member_1: vec2<f32>,
    @location(2) member_2: vec4<f32>,
    @location(3) member_3: vec3<f32>,
    @location(4) member_4: vec3<f32>,
    @location(5) member_5: vec4<f32>,
}

var<private> inNormal_1: vec3<f32>;
var<private> inTangent_1: vec4<f32>;
@group(0) @binding(0) 
var<uniform> ubo: UniformBufferObject;
var<private> inWeights0_1: vec4<f32>;
@group(0) @binding(1) 
var<uniform> r_SkinMatrixBuffer: SkinMatrixBuffer;
var<private> inJoint0_1: vec4<u32>;
var<private> inPosition_1: vec3<f32>;
var<private> perVertexStruct: gl_PerVertex = gl_PerVertex(vec4<f32>(0.0, 0.0, 0.0, 1.0), 1.0, array<f32,1u>(0.0), array<f32,1u>(0.0));
var<private> f_WorldNormal: vec3<f32>;
var<private> f_Texcoord: vec2<f32>;
var<private> inTexcoord_1: vec2<f32>;
var<private> f_WorldPos: vec4<f32>;
var<private> f_WorldTangent: vec3<f32>;
var<private> f_WorldBioTangent: vec3<f32>;
var<private> f_LightSpacePos: vec4<f32>;

fn main_1() {
    var BioTangent: vec3<f32>;
    var SkinMat: mat4x4<f32>;
    var WorldPos: vec4<f32>;
    var WorldNormal: vec3<f32>;
    var WorldTangent: vec3<f32>;
    var WorldBioTangent: vec3<f32>;

    let _e37 = inNormal_1;
    let _e38 = inTangent_1;
    BioTangent = cross(_e37, _e38.xyz);
    let _e42 = ubo.useSkinMeshAnimation;
    if (_e42 != 0) {
        let _e45 = inWeights0_1[0u];
        let _e47 = inJoint0_1[0u];
        let _e50 = r_SkinMatrixBuffer.SkinMat[_e47];
        let _e51 = (_e50 * _e45);
        let _e53 = inWeights0_1[1u];
        let _e55 = inJoint0_1[1u];
        let _e58 = r_SkinMatrixBuffer.SkinMat[_e55];
        let _e59 = (_e58 * _e53);
        let _e72 = mat4x4<f32>((_e51[0] + _e59[0]), (_e51[1] + _e59[1]), (_e51[2] + _e59[2]), (_e51[3] + _e59[3]));
        let _e74 = inWeights0_1[2u];
        let _e76 = inJoint0_1[2u];
        let _e79 = r_SkinMatrixBuffer.SkinMat[_e76];
        let _e80 = (_e79 * _e74);
        let _e93 = mat4x4<f32>((_e72[0] + _e80[0]), (_e72[1] + _e80[1]), (_e72[2] + _e80[2]), (_e72[3] + _e80[3]));
        let _e95 = inWeights0_1[3u];
        let _e97 = inJoint0_1[3u];
        let _e100 = r_SkinMatrixBuffer.SkinMat[_e97];
        let _e101 = (_e100 * _e95);
        SkinMat = mat4x4<f32>((_e93[0] + _e101[0]), (_e93[1] + _e101[1]), (_e93[2] + _e101[2]), (_e93[3] + _e101[3]));
        let _e115 = SkinMat;
        let _e116 = inPosition_1;
        WorldPos = (_e115 * vec4<f32>(_e116.x, _e116.y, _e116.z, 1.0));
        let _e122 = SkinMat;
        let _e123 = inNormal_1;
        WorldNormal = normalize((_e122 * vec4<f32>(_e123.x, _e123.y, _e123.z, 0.0)).xyz);
        let _e131 = SkinMat;
        let _e132 = inTangent_1;
        WorldTangent = normalize((_e131 * _e132).xyz);
        let _e136 = SkinMat;
        let _e137 = BioTangent;
        WorldBioTangent = normalize((_e136 * vec4<f32>(_e137.x, _e137.y, _e137.z, 0.0)).xyz);
    } else {
        let _e146 = ubo.model;
        let _e147 = inPosition_1;
        WorldPos = (_e146 * vec4<f32>(_e147.x, _e147.y, _e147.z, 1.0));
        let _e154 = ubo.model;
        let _e155 = inNormal_1;
        WorldNormal = normalize((_e154 * vec4<f32>(_e155.x, _e155.y, _e155.z, 0.0)).xyz);
        let _e164 = ubo.model;
        let _e165 = inTangent_1;
        WorldTangent = normalize((_e164 * _e165).xyz);
        let _e170 = ubo.model;
        let _e171 = BioTangent;
        WorldBioTangent = normalize((_e170 * vec4<f32>(_e171.x, _e171.y, _e171.z, 0.0)).xyz);
    }
    let _e180 = ubo.proj;
    let _e182 = ubo.view;
    let _e184 = WorldPos;
    perVertexStruct.gl_Position = ((_e180 * _e182) * _e184);
    let _e187 = WorldNormal;
    f_WorldNormal = _e187;
    let _e188 = inTexcoord_1;
    f_Texcoord = _e188;
    let _e189 = WorldPos;
    f_WorldPos = _e189;
    let _e190 = WorldTangent;
    f_WorldTangent = _e190;
    let _e191 = WorldBioTangent;
    f_WorldBioTangent = _e191;
    let _e193 = ubo.lightVPMat;
    let _e194 = WorldPos;
    f_LightSpacePos = (_e193 * _e194);
    return;
}

@vertex 
fn main(@location(1) inNormal: vec3<f32>, @location(3) inTangent: vec4<f32>, @location(5) inWeights0_: vec4<f32>, @location(4) inJoint0_: vec4<u32>, @location(0) inPosition: vec3<f32>, @location(2) inTexcoord: vec2<f32>) -> VertexOutput {
    inNormal_1 = inNormal;
    inTangent_1 = inTangent;
    inWeights0_1 = inWeights0_;
    inJoint0_1 = inJoint0_;
    inPosition_1 = inPosition;
    inTexcoord_1 = inTexcoord;
    main_1();
    let _e21 = perVertexStruct.gl_Position.y;
    perVertexStruct.gl_Position.y = -(_e21);
    let _e23 = perVertexStruct.gl_Position;
    let _e24 = f_WorldNormal;
    let _e25 = f_Texcoord;
    let _e26 = f_WorldPos;
    let _e27 = f_WorldTangent;
    let _e28 = f_WorldBioTangent;
    let _e29 = f_LightSpacePos;
    return VertexOutput(_e23, _e24, _e25, _e26, _e27, _e28, _e29);
}
