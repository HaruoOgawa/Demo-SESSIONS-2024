struct gl_PerVertex {
    @builtin(position) gl_Position: vec4<f32>,
    gl_PointSize: f32,
    gl_ClipDistance: array<f32,1u>,
    gl_CullDistance: array<f32,1u>,
}

struct VertexUniformBuffer {
    model: mat4x4<f32>,
    view: mat4x4<f32>,
    proj: mat4x4<f32>,
    lightVPMat: mat4x4<f32>,
}

struct VertexOutput {
    @builtin(position) gl_Position: vec4<f32>,
    @location(0) member: vec4<f32>,
}

var<private> perVertexStruct: gl_PerVertex = gl_PerVertex(vec4<f32>(0.0, 0.0, 0.0, 1.0), 1.0, array<f32,1u>(0.0), array<f32,1u>(0.0));
@group(0) @binding(0) 
var<uniform> v_ubo: VertexUniformBuffer;
var<private> inPosition_1: vec3<f32>;
var<private> v2f_ObjectPos: vec4<f32>;
var<private> inNormal_1: vec3<f32>;
var<private> inTexcoord_1: vec2<f32>;
var<private> inTangent_1: vec4<f32>;
var<private> inBone0_1: vec4<u32>;
var<private> inWeights0_1: vec4<f32>;

fn main_1() {
    let _e19 = v_ubo.proj;
    let _e21 = v_ubo.view;
    let _e24 = v_ubo.model;
    let _e26 = inPosition_1;
    perVertexStruct.gl_Position = (((_e19 * _e21) * _e24) * vec4<f32>(_e26.x, _e26.y, _e26.z, 1.0));
    let _e33 = inPosition_1;
    v2f_ObjectPos = vec4<f32>(_e33.x, _e33.y, _e33.z, 1.0);
    return;
}

@vertex 
fn main(@location(0) inPosition: vec3<f32>, @location(1) inNormal: vec3<f32>, @location(2) inTexcoord: vec2<f32>, @location(3) inTangent: vec4<f32>, @location(4) inBone0_: vec4<u32>, @location(5) inWeights0_: vec4<f32>) -> VertexOutput {
    inPosition_1 = inPosition;
    inNormal_1 = inNormal;
    inTexcoord_1 = inTexcoord;
    inTangent_1 = inTangent;
    inBone0_1 = inBone0_;
    inWeights0_1 = inWeights0_;
    main_1();
    let _e16 = perVertexStruct.gl_Position.y;
    perVertexStruct.gl_Position.y = -(_e16);
    let _e18 = perVertexStruct.gl_Position;
    let _e19 = v2f_ObjectPos;
    return VertexOutput(_e18, _e19);
}
