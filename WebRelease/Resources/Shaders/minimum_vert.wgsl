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
    cameraPos: vec4<f32>,
}

struct VertexOutput {
    @builtin(position) gl_Position: vec4<f32>,
    @location(0) member: vec3<f32>,
    @location(1) member_1: vec2<f32>,
    @location(2) member_2: vec3<f32>,
}

var<private> perVertexStruct: gl_PerVertex = gl_PerVertex(vec4<f32>(0.0, 0.0, 0.0, 1.0), 1.0, array<f32,1u>(0.0), array<f32,1u>(0.0));
@group(0) @binding(0) 
var<uniform> ubo: UniformBufferObject;
var<private> inPosition_1: vec3<f32>;
var<private> fWolrdNormal: vec3<f32>;
var<private> inNormal_1: vec3<f32>;
var<private> fUV: vec2<f32>;
var<private> inTexcoord_1: vec2<f32>;
var<private> fViewDir: vec3<f32>;
var<private> inTangent_1: vec4<f32>;
var<private> inJoint0_1: vec4<u32>;
var<private> inWeights0_1: vec4<f32>;

fn main_1() {
    let _e23 = ubo.proj;
    let _e25 = ubo.view;
    let _e28 = ubo.model;
    let _e30 = inPosition_1;
    perVertexStruct.gl_Position = (((_e23 * _e25) * _e28) * vec4<f32>(_e30.x, _e30.y, _e30.z, 1.0));
    let _e38 = ubo.model;
    let _e39 = inNormal_1;
    fWolrdNormal = (_e38 * vec4<f32>(_e39.x, _e39.y, _e39.z, 0.0)).xyz;
    let _e46 = inTexcoord_1;
    fUV = _e46;
    let _e48 = ubo.model;
    let _e49 = inPosition_1;
    let _e57 = ubo.cameraPos;
    fViewDir = normalize(((_e48 * vec4<f32>(_e49.x, _e49.y, _e49.z, 1.0)).xyz - _e57.xyz));
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
    let _e18 = perVertexStruct.gl_Position.y;
    perVertexStruct.gl_Position.y = -(_e18);
    let _e20 = perVertexStruct.gl_Position;
    let _e21 = fWolrdNormal;
    let _e22 = fUV;
    let _e23 = fViewDir;
    return VertexOutput(_e20, _e21, _e22, _e23);
}
