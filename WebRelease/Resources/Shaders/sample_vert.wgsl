struct gl_PerVertex {
    @builtin(position) gl_Position: vec4<f32>,
    gl_PointSize: f32,
    gl_ClipDistance: array<f32,1u>,
    gl_CullDistance: array<f32,1u>,
}

struct UniformBufferObject {
    model: mat4x4<f32>,
    view: mat4x4<f32>,
    proj: mat4x4<f32>,
    lightVPMat: mat4x4<f32>,
    color: vec4<f32>,
    useTexture: i32,
    pad0_: i32,
    pad1_: i32,
    pad2_: i32,
}

struct SkinMatrixBuffer {
    SkinMat: array<mat4x4<f32>>,
}

struct VertexOutput {
    @builtin(position) gl_Position: vec4<f32>,
    @location(0) member: vec3<f32>,
    @location(1) member_1: vec2<f32>,
    @location(2) member_2: vec4<f32>,
    @location(3) member_3: vec4<f32>,
}

var<private> perVertexStruct: gl_PerVertex = gl_PerVertex(vec4<f32>(0.0, 0.0, 0.0, 1.0), 1.0, array<f32,1u>(0.0), array<f32,1u>(0.0));
@group(0) @binding(0) 
var<uniform> ubo: UniformBufferObject;
@group(0) @binding(3) 
var<storage> r_SkinMatrixBuffer: SkinMatrixBuffer;
var<private> inPosition_1: vec3<f32>;
var<private> f_WorldNormal: vec3<f32>;
var<private> inNormal_1: vec3<f32>;
var<private> f_Texcoord: vec2<f32>;
var<private> inTexcoord_1: vec2<f32>;
var<private> f_WorldPos: vec4<f32>;
var<private> f_Color: vec4<f32>;
var<private> inTangent_1: vec4<f32>;
var<private> inJoint0_1: vec4<u32>;
var<private> inWeights0_1: vec4<f32>;

fn main_1() {
    let _e25 = ubo.proj;
    let _e27 = ubo.view;
    let _e30 = ubo.model;
    let _e34 = r_SkinMatrixBuffer.SkinMat[0];
    let _e36 = inPosition_1;
    perVertexStruct.gl_Position = ((((_e25 * _e27) * _e30) * _e34) * vec4<f32>(_e36.x, _e36.y, _e36.z, 1.0));
    let _e44 = ubo.model;
    let _e45 = inNormal_1;
    f_WorldNormal = (_e44 * vec4<f32>(_e45.x, _e45.y, _e45.z, 0.0)).xyz;
    let _e52 = inTexcoord_1;
    f_Texcoord = _e52;
    let _e54 = ubo.model;
    let _e55 = inPosition_1;
    f_WorldPos = (_e54 * vec4<f32>(_e55.x, _e55.y, _e55.z, 1.0));
    let _e62 = ubo.color;
    f_Color = _e62;
    return;
}

@vertex 
fn main(@location(0) inPosition: vec3<f32>, @location(1) inNormal: vec3<f32>, @location(2) inTexcoord: vec2<f32>, @location(3) inTangent: vec4<f32>, @location(4) inJoint0_: vec4<u32>, @location(5) inWeights0_: vec4<f32>) -> VertexOutput {
    inPosition_1 = inPosition;
    inNormal_1 = inNormal;
    inTexcoord_1 = inTexcoord;
    inTangent_1 = inTangent;
    inJoint0_1 = inJoint0_;
    inWeights0_1 = inWeights0_;
    main_1();
    let _e19 = perVertexStruct.gl_Position.y;
    perVertexStruct.gl_Position.y = -(_e19);
    let _e21 = perVertexStruct.gl_Position;
    let _e22 = f_WorldNormal;
    let _e23 = f_Texcoord;
    let _e24 = f_WorldPos;
    let _e25 = f_Color;
    return VertexOutput(_e21, _e22, _e23, _e24, _e25);
}
