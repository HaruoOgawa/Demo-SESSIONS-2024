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

var<private> f_Color_1: vec4<f32>;
var<private> f_Texcoord_1: vec2<f32>;
@group(0) @binding(0) 
var<uniform> ubo: UniformBufferObject;
@group(0) @binding(1) 
var baseColorTexture: texture_2d<f32>;
@group(0) @binding(2) 
var baseColorTextureSampler: sampler;
var<private> outColor: vec4<f32>;
var<private> f_WorldNormal_1: vec3<f32>;
var<private> f_WorldPos_1: vec4<f32>;

fn main_1() {
    var col: vec4<f32>;

    let _e18 = f_Color_1;
    col = _e18;
    let _e19 = f_Texcoord_1;
    col[0u] = _e19.x;
    col[1u] = _e19.y;
    let _e25 = ubo.useTexture;
    if (_e25 != 0) {
        let _e27 = f_Texcoord_1;
        let _e28 = textureSample(baseColorTexture, baseColorTextureSampler, _e27);
        let _e29 = _e28.xyz;
        col[0u] = _e29.x;
        col[1u] = _e29.y;
        col[2u] = _e29.z;
    }
    let _e36 = col;
    outColor = _e36;
    return;
}

@fragment 
fn main(@location(3) f_Color: vec4<f32>, @location(1) f_Texcoord: vec2<f32>, @location(0) f_WorldNormal: vec3<f32>, @location(2) f_WorldPos: vec4<f32>) -> @location(0) vec4<f32> {
    f_Color_1 = f_Color;
    f_Texcoord_1 = f_Texcoord;
    f_WorldNormal_1 = f_WorldNormal;
    f_WorldPos_1 = f_WorldPos;
    main_1();
    let _e9 = outColor;
    return _e9;
}
