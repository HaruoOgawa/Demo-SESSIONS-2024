struct UniformBufferObject {
    model: mat4x4<f32>,
    view: mat4x4<f32>,
    proj: mat4x4<f32>,
    lightVPMat: mat4x4<f32>,
    edgeSize: f32,
    fPad0_: f32,
    fPad1_: f32,
    fPad2_: f32,
    useSkinMeshAnimation: i32,
    pad0_: i32,
    drawPathIndex: i32,
    pad1_: i32,
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
    @location(6) member_6: vec2<f32>,
}

var<private> inNormal_1: vec3<f32>;
var<private> inTangent_1: vec4<f32>;
var<private> inPosition_1: vec3<f32>;
@group(0) @binding(0) 
var<uniform> ubo: UniformBufferObject;
var<private> inWeights0_1: vec4<f32>;
@group(0) @binding(1) 
var<uniform> r_SkinMatrixBuffer: SkinMatrixBuffer;
var<private> inBone0_1: vec4<u32>;
var<private> perVertexStruct: gl_PerVertex = gl_PerVertex(vec4<f32>(0.0, 0.0, 0.0, 1.0), 1.0, array<f32,1u>(0.0), array<f32,1u>(0.0));
var<private> f_WorldNormal: vec3<f32>;
var<private> f_Texcoord: vec2<f32>;
var<private> inTexcoord_1: vec2<f32>;
var<private> f_WorldPos: vec4<f32>;
var<private> f_WorldTangent: vec3<f32>;
var<private> f_WorldBioTangent: vec3<f32>;
var<private> f_LightSpacePos: vec4<f32>;
var<private> f_SphereUV: vec2<f32>;

fn main_1() {
    var BioTangent: vec3<f32>;
    var LocalPos: vec3<f32>;
    var SkinMat: mat4x4<f32>;
    var WorldPos: vec4<f32>;
    var WorldNormal: vec3<f32>;
    var WorldTangent: vec3<f32>;
    var WorldBioTangent: vec3<f32>;
    var VNormal: vec4<f32>;
    var SphereUV: vec2<f32>;
    var ViewSpaceOutline: bool;
    var CameraPos: vec4<f32>;
    var CameraNormal: vec3<f32>;

    let _e49 = inNormal_1;
    let _e50 = inTangent_1;
    BioTangent = cross(_e49, _e50.xyz);
    let _e53 = inPosition_1;
    LocalPos = _e53;
    let _e55 = ubo.useSkinMeshAnimation;
    if (_e55 != 0) {
        let _e58 = inWeights0_1[0u];
        let _e60 = inBone0_1[0u];
        let _e63 = r_SkinMatrixBuffer.SkinMat[_e60];
        let _e64 = (_e63 * _e58);
        let _e66 = inWeights0_1[1u];
        let _e68 = inBone0_1[1u];
        let _e71 = r_SkinMatrixBuffer.SkinMat[_e68];
        let _e72 = (_e71 * _e66);
        let _e85 = mat4x4<f32>((_e64[0] + _e72[0]), (_e64[1] + _e72[1]), (_e64[2] + _e72[2]), (_e64[3] + _e72[3]));
        let _e87 = inWeights0_1[2u];
        let _e89 = inBone0_1[2u];
        let _e92 = r_SkinMatrixBuffer.SkinMat[_e89];
        let _e93 = (_e92 * _e87);
        let _e106 = mat4x4<f32>((_e85[0] + _e93[0]), (_e85[1] + _e93[1]), (_e85[2] + _e93[2]), (_e85[3] + _e93[3]));
        let _e108 = inWeights0_1[3u];
        let _e110 = inBone0_1[3u];
        let _e113 = r_SkinMatrixBuffer.SkinMat[_e110];
        let _e114 = (_e113 * _e108);
        SkinMat = mat4x4<f32>((_e106[0] + _e114[0]), (_e106[1] + _e114[1]), (_e106[2] + _e114[2]), (_e106[3] + _e114[3]));
        let _e128 = SkinMat;
        let _e129 = LocalPos;
        WorldPos = (_e128 * vec4<f32>(_e129.x, _e129.y, _e129.z, 1.0));
        let _e135 = SkinMat;
        let _e136 = inNormal_1;
        WorldNormal = normalize((_e135 * vec4<f32>(_e136.x, _e136.y, _e136.z, 0.0)).xyz);
        let _e144 = SkinMat;
        let _e145 = inTangent_1;
        WorldTangent = normalize((_e144 * _e145).xyz);
        let _e149 = SkinMat;
        let _e150 = BioTangent;
        WorldBioTangent = normalize((_e149 * vec4<f32>(_e150.x, _e150.y, _e150.z, 0.0)).xyz);
    } else {
        let _e159 = ubo.model;
        let _e160 = LocalPos;
        WorldPos = (_e159 * vec4<f32>(_e160.x, _e160.y, _e160.z, 1.0));
        let _e167 = ubo.model;
        let _e168 = inNormal_1;
        WorldNormal = normalize((_e167 * vec4<f32>(_e168.x, _e168.y, _e168.z, 0.0)).xyz);
        let _e177 = ubo.model;
        let _e178 = inTangent_1;
        WorldTangent = normalize((_e177 * _e178).xyz);
        let _e183 = ubo.model;
        let _e184 = BioTangent;
        WorldBioTangent = normalize((_e183 * vec4<f32>(_e184.x, _e184.y, _e184.z, 0.0)).xyz);
    }
    let _e193 = ubo.view;
    let _e194 = WorldNormal;
    VNormal = (_e193 * vec4<f32>(_e194.x, _e194.y, _e194.z, 0.0));
    let _e200 = VNormal;
    SphereUV = ((_e200.xy * 0.5) + vec2<f32>(0.5));
    let _e206 = ubo.drawPathIndex;
    if (_e206 == 2) {
        ViewSpaceOutline = false;
        let _e208 = ViewSpaceOutline;
        if _e208 {
            let _e210 = ubo.view;
            let _e211 = WorldPos;
            CameraPos = (_e210 * _e211);
            let _e214 = ubo.view;
            let _e215 = WorldNormal;
            CameraNormal = (_e214 * vec4<f32>(_e215.x, _e215.y, _e215.z, 0.0)).xyz;
            let _e222 = CameraNormal;
            let _e226 = ubo.edgeSize;
            let _e229 = CameraPos;
            let _e231 = (_e229.xy + ((normalize(_e222).xy * _e226) * 0.0010000000474974513));
            CameraPos[0u] = _e231.x;
            CameraPos[1u] = _e231.y;
            let _e237 = ubo.proj;
            let _e238 = CameraPos;
            perVertexStruct.gl_Position = (_e237 * _e238);
        } else {
            let _e241 = WorldNormal;
            let _e244 = ubo.edgeSize;
            let _e247 = WorldPos;
            let _e249 = (_e247.xyz + ((normalize(_e241) * _e244) * 0.0010000000474974513));
            WorldPos[0u] = _e249.x;
            WorldPos[1u] = _e249.y;
            WorldPos[2u] = _e249.z;
            let _e257 = ubo.proj;
            let _e259 = ubo.view;
            let _e261 = WorldPos;
            perVertexStruct.gl_Position = ((_e257 * _e259) * _e261);
        }
    } else {
        let _e265 = ubo.proj;
        let _e267 = ubo.view;
        let _e269 = WorldPos;
        perVertexStruct.gl_Position = ((_e265 * _e267) * _e269);
    }
    let _e272 = WorldNormal;
    f_WorldNormal = _e272;
    let _e273 = inTexcoord_1;
    f_Texcoord = _e273;
    let _e274 = WorldPos;
    f_WorldPos = _e274;
    let _e275 = WorldTangent;
    f_WorldTangent = _e275;
    let _e276 = WorldBioTangent;
    f_WorldBioTangent = _e276;
    let _e278 = ubo.lightVPMat;
    let _e279 = WorldPos;
    f_LightSpacePos = (_e278 * _e279);
    let _e281 = SphereUV;
    f_SphereUV = _e281;
    return;
}

@vertex 
fn main(@location(1) inNormal: vec3<f32>, @location(3) inTangent: vec4<f32>, @location(0) inPosition: vec3<f32>, @location(5) inWeights0_: vec4<f32>, @location(4) inBone0_: vec4<u32>, @location(2) inTexcoord: vec2<f32>) -> VertexOutput {
    inNormal_1 = inNormal;
    inTangent_1 = inTangent;
    inPosition_1 = inPosition;
    inWeights0_1 = inWeights0_;
    inBone0_1 = inBone0_;
    inTexcoord_1 = inTexcoord;
    main_1();
    let _e22 = perVertexStruct.gl_Position.y;
    perVertexStruct.gl_Position.y = -(_e22);
    let _e24 = perVertexStruct.gl_Position;
    let _e25 = f_WorldNormal;
    let _e26 = f_Texcoord;
    let _e27 = f_WorldPos;
    let _e28 = f_WorldTangent;
    let _e29 = f_WorldBioTangent;
    let _e30 = f_LightSpacePos;
    let _e31 = f_SphereUV;
    return VertexOutput(_e24, _e25, _e26, _e27, _e28, _e29, _e30, _e31);
}
