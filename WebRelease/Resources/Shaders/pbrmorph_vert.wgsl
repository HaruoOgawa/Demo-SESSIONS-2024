struct MorphUniformBufferObject {
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
    MorphWeight_0_: f32,
    MorphWeight_1_: f32,
    fPad0_: f32,
    fPad1_: f32,
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
    useMorph: i32,
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
var<private> inPosition_1: vec3<f32>;
@group(0) @binding(0) 
var<uniform> ubo: MorphUniformBufferObject;
var<private> inMorphVec0_1: vec3<f32>;
var<private> inMorphVec1_1: vec3<f32>;
var<private> inWeights0_1: vec4<f32>;
@group(0) @binding(1) 
var<uniform> r_SkinMatrixBuffer: SkinMatrixBuffer;
var<private> inJoint0_1: vec4<u32>;
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
    var LocalPos: vec3<f32>;
    var SkinMat: mat4x4<f32>;
    var WorldPos: vec4<f32>;
    var WorldNormal: vec3<f32>;
    var WorldTangent: vec3<f32>;
    var WorldBioTangent: vec3<f32>;

    let _e43 = inNormal_1;
    let _e44 = inTangent_1;
    BioTangent = cross(_e43, _e44.xyz);
    let _e47 = inPosition_1;
    LocalPos = _e47;
    let _e49 = ubo.useMorph;
    if (_e49 != 0) {
        let _e51 = inMorphVec0_1;
        let _e53 = ubo.MorphWeight_0_;
        let _e55 = inMorphVec1_1;
        let _e57 = ubo.MorphWeight_1_;
        let _e60 = LocalPos;
        LocalPos = (_e60 + ((_e51 * _e53) + (_e55 * _e57)));
    }
    let _e63 = ubo.useSkinMeshAnimation;
    if (_e63 != 0) {
        let _e66 = inWeights0_1[0u];
        let _e68 = inJoint0_1[0u];
        let _e71 = r_SkinMatrixBuffer.SkinMat[_e68];
        let _e72 = (_e71 * _e66);
        let _e74 = inWeights0_1[1u];
        let _e76 = inJoint0_1[1u];
        let _e79 = r_SkinMatrixBuffer.SkinMat[_e76];
        let _e80 = (_e79 * _e74);
        let _e93 = mat4x4<f32>((_e72[0] + _e80[0]), (_e72[1] + _e80[1]), (_e72[2] + _e80[2]), (_e72[3] + _e80[3]));
        let _e95 = inWeights0_1[2u];
        let _e97 = inJoint0_1[2u];
        let _e100 = r_SkinMatrixBuffer.SkinMat[_e97];
        let _e101 = (_e100 * _e95);
        let _e114 = mat4x4<f32>((_e93[0] + _e101[0]), (_e93[1] + _e101[1]), (_e93[2] + _e101[2]), (_e93[3] + _e101[3]));
        let _e116 = inWeights0_1[3u];
        let _e118 = inJoint0_1[3u];
        let _e121 = r_SkinMatrixBuffer.SkinMat[_e118];
        let _e122 = (_e121 * _e116);
        SkinMat = mat4x4<f32>((_e114[0] + _e122[0]), (_e114[1] + _e122[1]), (_e114[2] + _e122[2]), (_e114[3] + _e122[3]));
        let _e136 = SkinMat;
        let _e137 = LocalPos;
        WorldPos = (_e136 * vec4<f32>(_e137.x, _e137.y, _e137.z, 1.0));
        let _e143 = SkinMat;
        let _e144 = inNormal_1;
        WorldNormal = normalize((_e143 * vec4<f32>(_e144.x, _e144.y, _e144.z, 0.0)).xyz);
        let _e152 = SkinMat;
        let _e153 = inTangent_1;
        WorldTangent = normalize((_e152 * _e153).xyz);
        let _e157 = SkinMat;
        let _e158 = BioTangent;
        WorldBioTangent = normalize((_e157 * vec4<f32>(_e158.x, _e158.y, _e158.z, 0.0)).xyz);
    } else {
        let _e167 = ubo.model;
        let _e168 = LocalPos;
        WorldPos = (_e167 * vec4<f32>(_e168.x, _e168.y, _e168.z, 1.0));
        let _e175 = ubo.model;
        let _e176 = inNormal_1;
        WorldNormal = normalize((_e175 * vec4<f32>(_e176.x, _e176.y, _e176.z, 0.0)).xyz);
        let _e185 = ubo.model;
        let _e186 = inTangent_1;
        WorldTangent = normalize((_e185 * _e186).xyz);
        let _e191 = ubo.model;
        let _e192 = BioTangent;
        WorldBioTangent = normalize((_e191 * vec4<f32>(_e192.x, _e192.y, _e192.z, 0.0)).xyz);
    }
    let _e201 = ubo.proj;
    let _e203 = ubo.view;
    let _e205 = WorldPos;
    perVertexStruct.gl_Position = ((_e201 * _e203) * _e205);
    let _e208 = WorldNormal;
    f_WorldNormal = _e208;
    let _e209 = inTexcoord_1;
    f_Texcoord = _e209;
    let _e210 = WorldPos;
    f_WorldPos = _e210;
    let _e211 = WorldTangent;
    f_WorldTangent = _e211;
    let _e212 = WorldBioTangent;
    f_WorldBioTangent = _e212;
    let _e214 = ubo.lightVPMat;
    let _e215 = WorldPos;
    f_LightSpacePos = (_e214 * _e215);
    return;
}

@vertex 
fn main(@location(1) inNormal: vec3<f32>, @location(3) inTangent: vec4<f32>, @location(0) inPosition: vec3<f32>, @location(6) inMorphVec0_: vec3<f32>, @location(7) inMorphVec1_: vec3<f32>, @location(5) inWeights0_: vec4<f32>, @location(4) inJoint0_: vec4<u32>, @location(2) inTexcoord: vec2<f32>) -> VertexOutput {
    inNormal_1 = inNormal;
    inTangent_1 = inTangent;
    inPosition_1 = inPosition;
    inMorphVec0_1 = inMorphVec0_;
    inMorphVec1_1 = inMorphVec1_;
    inWeights0_1 = inWeights0_;
    inJoint0_1 = inJoint0_;
    inTexcoord_1 = inTexcoord;
    main_1();
    let _e25 = perVertexStruct.gl_Position.y;
    perVertexStruct.gl_Position.y = -(_e25);
    let _e27 = perVertexStruct.gl_Position;
    let _e28 = f_WorldNormal;
    let _e29 = f_Texcoord;
    let _e30 = f_WorldPos;
    let _e31 = f_WorldTangent;
    let _e32 = f_WorldBioTangent;
    let _e33 = f_LightSpacePos;
    return VertexOutput(_e27, _e28, _e29, _e30, _e31, _e32, _e33);
}
