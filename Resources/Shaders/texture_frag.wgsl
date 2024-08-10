var<private> fUV_1: vec2<f32>;
@group(0) @binding(0) 
var texImage: texture_2d<f32>;
@group(0) @binding(1) 
var texSampler: sampler;
var<private> outColor: vec4<f32>;

fn main_1() {
    var col: vec4<f32>;
    var st: vec2<f32>;

    col = vec4<f32>(1.0, 1.0, 1.0, 1.0);
    let _e15 = fUV_1;
    st = _e15;
    let _e16 = st;
    let _e17 = textureSample(texImage, texSampler, _e16);
    let _e18 = _e17.xyz;
    col[0u] = _e18.x;
    col[1u] = _e18.y;
    col[2u] = _e18.z;
    let _e25 = col;
    outColor = _e25;
    return;
}

@fragment 
fn main(@location(0) fUV: vec2<f32>) -> @location(0) vec4<f32> {
    fUV_1 = fUV;
    main_1();
    let _e3 = outColor;
    return _e3;
}
