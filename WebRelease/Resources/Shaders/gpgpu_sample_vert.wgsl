struct TestData {
    offset: vec4<f32>,
    color: vec4<f32>,
    AccumulateDeltaTime: f32,
    pad0_: f32,
    pad1_: f32,
    pad2_: f32,
}

struct TestBufferObject {
    data: array<TestData>,
}

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
}

struct VertexOutput {
    @builtin(position) gl_Position: vec4<f32>,
    @location(0) member: vec2<f32>,
    @location(1) member_1: vec4<f32>,
}

var<private> gl_InstanceIndex_1: i32;
@group(0) @binding(1) 
var<storage> r_TBO: TestBufferObject;
var<private> perVertexStruct: gl_PerVertex = gl_PerVertex(vec4<f32>(0.0, 0.0, 0.0, 1.0), 1.0, array<f32,1u>(0.0), array<f32,1u>(0.0));
@group(0) @binding(0) 
var<uniform> ubo: UniformBufferObject;
var<private> inPosition_1: vec3<f32>;
var<private> fragTexCoord: vec2<f32>;
var<private> inTexcoord_1: vec2<f32>;
var<private> fragColor: vec4<f32>;
var<private> inNormal_1: vec3<f32>;
var<private> inTangent_1: vec4<f32>;
var<private> inJoint0_1: vec4<u32>;
var<private> inWeights0_1: vec4<f32>;

fn main_1() {
    var id: i32;
    var offset: vec3<f32>;

    let _e23 = gl_InstanceIndex_1;
    id = _e23;
    let _e24 = id;
    let _e28 = r_TBO.data[_e24].offset;
    offset = _e28.xyz;
    let _e31 = ubo.proj;
    let _e33 = ubo.view;
    let _e36 = ubo.model;
    let _e38 = inPosition_1;
    let _e39 = offset;
    let _e40 = (_e38 + _e39);
    perVertexStruct.gl_Position = (((_e31 * _e33) * _e36) * vec4<f32>(_e40.x, _e40.y, _e40.z, 1.0));
    let _e47 = inTexcoord_1;
    fragTexCoord = _e47;
    let _e48 = id;
    let _e52 = r_TBO.data[_e48].color;
    fragColor = _e52;
    return;
}

@vertex 
fn main(@builtin(instance_index) gl_InstanceIndex: u32, @location(0) inPosition: vec3<f32>, @location(2) inTexcoord: vec2<f32>, @location(1) inNormal: vec3<f32>, @location(3) inTangent: vec4<f32>, @location(4) inJoint0_: vec4<u32>, @location(5) inWeights0_: vec4<f32>) -> VertexOutput {
    gl_InstanceIndex_1 = i32(gl_InstanceIndex);
    inPosition_1 = inPosition;
    inTexcoord_1 = inTexcoord;
    inNormal_1 = inNormal;
    inTangent_1 = inTangent;
    inJoint0_1 = inJoint0_;
    inWeights0_1 = inWeights0_;
    main_1();
    let _e20 = perVertexStruct.gl_Position.y;
    perVertexStruct.gl_Position.y = -(_e20);
    let _e22 = perVertexStruct.gl_Position;
    let _e23 = fragTexCoord;
    let _e24 = fragColor;
    return VertexOutput(_e22, _e23, _e24);
}
