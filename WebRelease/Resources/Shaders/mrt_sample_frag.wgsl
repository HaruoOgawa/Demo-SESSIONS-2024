struct Light {
    Posision: vec3<f32>,
    Color: vec3<f32>,
}

struct FragmentOutput {
    @location(0) member: vec4<f32>,
    @builtin(frag_depth) member_1: f32,
}

var<private> fUV_1: vec2<f32>;
@group(0) @binding(1) 
var texGPosition: texture_2d<f32>;
@group(0) @binding(2) 
var texGPositionSampler: sampler;
@group(0) @binding(3) 
var texGNormal: texture_2d<f32>;
@group(0) @binding(4) 
var texGNormalSampler: sampler;
@group(0) @binding(5) 
var texGAlbedo: texture_2d<f32>;
@group(0) @binding(6) 
var texGAlbedoSampler: sampler;
@group(0) @binding(7) 
var texDepth: texture_2d<f32>;
@group(0) @binding(8) 
var texDepthSampler: sampler;
var<private> outColor: vec4<f32>;
var<private> gl_FragDepth: f32 = 0.0;

fn main_1() {
    var col: vec4<f32>;
    var st: vec2<f32>;
    var id: vec2<f32>;
    var GPositionCol: vec4<f32>;
    var GNormalCol: vec4<f32>;
    var GAlbedoCol: vec4<f32>;
    var GDepthCol: vec4<f32>;
    var width: f32;
    var lightList: array<Light,5u>;
    var i: i32;
    var lightDir: vec3<f32>;
    var diffuse: vec3<f32>;

    col = vec4<f32>(0.0, 0.0, 0.0, 1.0);
    let _e49 = fUV_1;
    st = _e49;
    let _e50 = fUV_1;
    id = floor((_e50 * 2.0));
    let _e53 = st;
    let _e54 = textureSample(texGPosition, texGPositionSampler, _e53);
    GPositionCol = _e54;
    let _e55 = st;
    let _e56 = textureSample(texGNormal, texGNormalSampler, _e55);
    GNormalCol = _e56;
    let _e57 = st;
    let _e58 = textureSample(texGAlbedo, texGAlbedoSampler, _e57);
    GAlbedoCol = _e58;
    let _e59 = st;
    let _e60 = textureSample(texDepth, texDepthSampler, _e59);
    GDepthCol = _e60;
    width = 3.0;
    lightList[0].Posision = vec3<f32>(0.0, 1.0, 0.0);
    lightList[0].Color = vec3<f32>(1.0, 1.0, 1.0);
    let _e65 = width;
    lightList[1].Posision = vec3<f32>((1.0 * _e65), 1.0, 0.0);
    lightList[1].Color = vec3<f32>(1.0, 0.0, 0.0);
    let _e72 = width;
    lightList[2].Posision = vec3<f32>((-1.0 * _e72), 1.0, 0.0);
    lightList[2].Color = vec3<f32>(0.0, 1.0, 0.0);
    let _e79 = width;
    lightList[3].Posision = vec3<f32>((-2.0 * _e79), 1.0, 0.0);
    lightList[3].Color = vec3<f32>(0.0, 0.0, 1.0);
    let _e86 = width;
    lightList[4].Posision = vec3<f32>((-2.0 * _e86), 1.0, 0.0);
    lightList[4].Color = vec3<f32>(1.0, 0.0, 1.0);
    i = 0;
    loop {
        let _e93 = i;
        if (_e93 < 5) {
            let _e95 = i;
            let _e98 = lightList[_e95].Posision;
            let _e99 = GPositionCol;
            lightDir = normalize((_e98 - _e99.xyz));
            let _e103 = GNormalCol;
            let _e105 = lightDir;
            let _e108 = GAlbedoCol;
            let _e111 = i;
            let _e114 = lightList[_e111].Color;
            diffuse = ((_e108.xyz * max(0.0, dot(_e103.xyz, _e105))) * _e114);
            let _e116 = diffuse;
            let _e117 = col;
            let _e119 = (_e117.xyz + _e116);
            col[0u] = _e119.x;
            col[1u] = _e119.y;
            col[2u] = _e119.z;
            continue;
        } else {
            break;
        }
        continuing {
            let _e126 = i;
            i = (_e126 + 1);
        }
    }
    let _e128 = col;
    outColor = _e128;
    let _e130 = GDepthCol[0u];
    gl_FragDepth = _e130;
    return;
}

@fragment 
fn main(@location(0) fUV: vec2<f32>) -> FragmentOutput {
    fUV_1 = fUV;
    main_1();
    let _e4 = outColor;
    let _e5 = gl_FragDepth;
    return FragmentOutput(_e4, _e5);
}
