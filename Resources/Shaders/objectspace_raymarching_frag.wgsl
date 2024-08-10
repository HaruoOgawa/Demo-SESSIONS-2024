struct FragmentUniformBuffer {
    invModel: mat4x4<f32>,
    model: mat4x4<f32>,
    view: mat4x4<f32>,
    proj: mat4x4<f32>,
    cameraPos: vec4<f32>,
    mainColor: vec4<f32>,
    v4Pad1_: vec4<f32>,
    v4Pad2_: vec4<f32>,
    time: f32,
    fPad0_: f32,
    fPad1_: f32,
    fPad2_: f32,
}

struct FragmentOutput {
    @location(0) member: vec4<f32>,
    @location(1) member_1: vec4<f32>,
    @location(2) member_2: vec4<f32>,
    @location(3) member_3: vec4<f32>,
    @builtin(frag_depth) member_4: f32,
}

@group(0) @binding(1) 
var<uniform> f_ubo: FragmentUniformBuffer;
var<private> v2f_ObjectPos_1: vec4<f32>;
var<private> gl_FragCoord_1: vec4<f32>;
var<private> gPosition: vec4<f32>;
var<private> gNormal: vec4<f32>;
var<private> gAlbedo: vec4<f32>;
var<private> gDepth: vec4<f32>;
var<private> gl_FragDepth: f32 = 0.0;

fn mapvf3_(p: ptr<function, vec3<f32>>) -> f32 {
    let _e25 = (*p);
    return (length(_e25) - 0.5);
}

fn gnvf3_(p_1: ptr<function, vec3<f32>>) -> vec3<f32> {
    var e: vec2<f32>;
    var param: vec3<f32>;
    var param_1: vec3<f32>;
    var param_2: vec3<f32>;
    var param_3: vec3<f32>;
    var param_4: vec3<f32>;
    var param_5: vec3<f32>;

    e = vec2<f32>(9.999999747378752e-5, 0.0);
    let _e32 = (*p_1);
    let _e33 = e;
    param = (_e32 + _e33.xyy);
    let _e36 = mapvf3_((&param));
    let _e37 = (*p_1);
    let _e38 = e;
    param_1 = (_e37 - _e38.xyy);
    let _e41 = mapvf3_((&param_1));
    let _e43 = (*p_1);
    let _e44 = e;
    param_2 = (_e43 + _e44.yxy);
    let _e47 = mapvf3_((&param_2));
    let _e48 = (*p_1);
    let _e49 = e;
    param_3 = (_e48 - _e49.yxy);
    let _e52 = mapvf3_((&param_3));
    let _e54 = (*p_1);
    let _e55 = e;
    param_4 = (_e54 + _e55.yyx);
    let _e58 = mapvf3_((&param_4));
    let _e59 = (*p_1);
    let _e60 = e;
    param_5 = (_e59 - _e60.yyx);
    let _e63 = mapvf3_((&param_5));
    return normalize(vec3<f32>((_e36 - _e41), (_e47 - _e52), (_e58 - _e63)));
}

fn main_1() {
    var ro: vec3<f32>;
    var rd: vec3<f32>;
    var d: f32;
    var t: f32;
    var i: i32;
    var param_6: vec3<f32>;
    var p_2: vec3<f32>;
    var n: vec3<f32>;
    var param_7: vec3<f32>;
    var depth: f32;

    let _e35 = f_ubo.invModel;
    let _e37 = f_ubo.cameraPos;
    ro = (_e35 * _e37).xyz;
    let _e40 = v2f_ObjectPos_1;
    let _e42 = ro;
    rd = normalize((_e40.xyz - _e42));
    d = 1.0;
    t = 0.0;
    i = 0;
    loop {
        let _e45 = i;
        if (_e45 < 64) {
            let _e47 = ro;
            let _e48 = rd;
            let _e49 = t;
            param_6 = (_e47 + (_e48 * _e49));
            let _e52 = mapvf3_((&param_6));
            d = _e52;
            let _e53 = d;
            if (_e53 < 9.999999747378752e-5) {
                break;
            }
            let _e55 = d;
            let _e56 = t;
            t = (_e56 + _e55);
            continue;
        } else {
            break;
        }
        continuing {
            let _e58 = i;
            i = (_e58 + 1);
        }
    }
    let _e60 = d;
    let _e62 = t;
    if ((_e60 < 9.999999747378752e-5) && (_e62 < 100.0)) {
        let _e65 = ro;
        let _e66 = rd;
        let _e67 = t;
        p_2 = (_e65 + (_e66 * _e67));
        let _e70 = p_2;
        param_7 = _e70;
        let _e71 = gnvf3_((&param_7));
        n = _e71;
        let _e73 = gl_FragCoord_1[2u];
        depth = _e73;
        let _e74 = p_2;
        gPosition = vec4<f32>(_e74.x, _e74.y, _e74.z, 1.0);
        let _e79 = n;
        gNormal = vec4<f32>(_e79.x, _e79.y, _e79.z, 1.0);
        let _e85 = f_ubo.mainColor;
        gAlbedo = _e85;
        let _e86 = depth;
        gDepth = vec4<f32>(_e86);
        let _e88 = depth;
        gl_FragDepth = _e88;
    } else {
        discard;
    }
    return;
}

@fragment 
fn main(@location(0) v2f_ObjectPos: vec4<f32>, @builtin(position) gl_FragCoord: vec4<f32>) -> FragmentOutput {
    v2f_ObjectPos_1 = v2f_ObjectPos;
    gl_FragCoord_1 = gl_FragCoord;
    main_1();
    let _e9 = gPosition;
    let _e10 = gNormal;
    let _e11 = gAlbedo;
    let _e12 = gDepth;
    let _e13 = gl_FragDepth;
    return FragmentOutput(_e9, _e10, _e11, _e12, _e13);
}
