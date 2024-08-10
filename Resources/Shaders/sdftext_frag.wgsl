struct FragUniformBufferObject {
    pad0_: mat4x4<f32>,
    pad1_: mat4x4<f32>,
    pad2_: mat4x4<f32>,
    pad3_: mat4x4<f32>,
    maxWidth: f32,
    charWidth: f32,
    numOfChar: f32,
    textID: f32,
}

var<private> fUV_1: vec2<f32>;
@group(0) @binding(1) 
var<uniform> f_ubo: FragUniformBufferObject;
@group(0) @binding(2) 
var MainTexture: texture_2d<f32>;
@group(0) @binding(3) 
var MainTextureSampler: sampler;
var<private> outCol: vec4<f32>;
var<private> fWolrdNormal_1: vec3<f32>;
var<private> fViewDir_1: vec3<f32>;

fn main_1() {
    var col: vec4<f32>;
    var st: vec2<f32>;
    var uvCharW: f32;
    var dist: f32;
    var t: f32;
    var alpha: f32;

    col = vec4<f32>(0.0, 0.0, 0.0, 1.0);
    let _e29 = fUV_1;
    st = _e29;
    let _e31 = f_ubo.maxWidth;
    let _e34 = f_ubo.charWidth;
    uvCharW = ((1.0 / _e31) * _e34);
    let _e36 = uvCharW;
    let _e38 = st[0u];
    st[0u] = (_e38 * _e36);
    let _e41 = uvCharW;
    let _e43 = f_ubo.textID;
    let _e47 = st[0u];
    st[0u] = (_e47 + (_e41 * floor(_e43)));
    let _e51 = st[0u];
    let _e53 = st[1u];
    let _e56 = textureSample(MainTexture, MainTextureSampler, vec2<f32>(_e51, (1.0 - _e53)));
    dist = _e56.x;
    t = 0.5;
    let _e58 = t;
    let _e60 = t;
    let _e62 = dist;
    alpha = smoothstep((_e58 - 0.009999999776482582), (_e60 + 0.009999999776482582), _e62);
    let _e64 = alpha;
    if (_e64 > 0.5) {
        col[0u] = vec3<f32>(1.0, 1.0, 1.0).x;
        col[1u] = vec3<f32>(1.0, 1.0, 1.0).y;
        col[2u] = vec3<f32>(1.0, 1.0, 1.0).z;
    } else {
        discard;
    }
    let _e72 = col;
    outCol = _e72;
    return;
}

@fragment 
fn main(@location(1) fUV: vec2<f32>, @location(0) fWolrdNormal: vec3<f32>, @location(2) fViewDir: vec3<f32>) -> @location(0) vec4<f32> {
    fUV_1 = fUV;
    fWolrdNormal_1 = fWolrdNormal;
    fViewDir_1 = fViewDir;
    main_1();
    let _e7 = outCol;
    return _e7;
}
