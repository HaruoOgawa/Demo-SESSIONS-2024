struct FragBufferObject_0_ {
    useDirSampling: i32,
    time: f32,
    useTexColor: i32,
    useColor: i32,
    baseColor: vec4<f32>,
    mPad0_: mat4x4<f32>,
    mPad1_: mat4x4<f32>,
    mPad2_: mat4x4<f32>,
    mPad3_: mat4x4<f32>,
}

var<private> fUV_1: vec2<f32>;
@group(0) @binding(1) 
var<uniform> fbo_0_: FragBufferObject_0_;
var<private> fViewDir_1: vec3<f32>;
@group(0) @binding(2) 
var texImage: texture_2d<f32>;
@group(0) @binding(3) 
var texSampler: sampler;
var<private> outColor: vec4<f32>;
var<private> fWolrdNormal_1: vec3<f32>;

fn main_1() {
    var col: vec4<f32>;
    var st: vec2<f32>;
    var pi: f32;
    var theta: f32;
    var phi: f32;

    col = vec4<f32>(1.0, 1.0, 1.0, 1.0);
    let _e27 = fUV_1;
    st = _e27;
    let _e29 = fbo_0_.useTexColor;
    if (_e29 != 0) {
        let _e32 = fbo_0_.useDirSampling;
        if (_e32 != 0) {
            pi = 3.1414999961853027;
            let _e35 = fViewDir_1[1u];
            theta = acos(_e35);
            let _e38 = fViewDir_1[2u];
            let _e40 = fViewDir_1[0u];
            phi = atan2(_e38, _e40);
            let _e42 = phi;
            let _e43 = pi;
            let _e46 = theta;
            let _e47 = pi;
            st = vec2<f32>((_e42 / (2.0 * _e43)), (_e46 / _e47));
        }
        let _e50 = st;
        let _e51 = textureSample(texImage, texSampler, _e50);
        let _e52 = _e51.xyz;
        col[0u] = _e52.x;
        col[1u] = _e52.y;
        col[2u] = _e52.z;
    } else {
        let _e60 = fbo_0_.useColor;
        if (_e60 != 0) {
            let _e63 = fbo_0_.baseColor;
            col = _e63;
        }
    }
    let _e64 = col;
    outColor = _e64;
    return;
}

@fragment 
fn main(@location(1) fUV: vec2<f32>, @location(2) fViewDir: vec3<f32>, @location(0) fWolrdNormal: vec3<f32>) -> @location(0) vec4<f32> {
    fUV_1 = fUV;
    fViewDir_1 = fViewDir;
    fWolrdNormal_1 = fWolrdNormal;
    main_1();
    let _e7 = outColor;
    return _e7;
}
