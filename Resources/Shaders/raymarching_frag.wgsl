struct FragUniformBufferObject {
    mPad0_: mat4x4<f32>,
    mPad1_: mat4x4<f32>,
    mPad2_: mat4x4<f32>,
    mPad3_: mat4x4<f32>,
    resolution: vec2<f32>,
    time: f32,
    deltaTime: f32,
    baseColor: vec4<f32>,
    pmodcount: f32,
    offset: f32,
    rotyz: f32,
    rotxz: f32,
}

@group(0) @binding(0) 
var<uniform> fragUbo: FragUniformBufferObject;
var<private> v2f_UV_1: vec2<f32>;
var<private> outColor: vec4<f32>;

fn sdCrossvf3_(p: ptr<function, vec3<f32>>) -> f32 {
    var dxy: f32;
    var dyz: f32;
    var dzx: f32;

    let _e38 = (*p);
    (*p) = abs(_e38);
    let _e41 = (*p)[0u];
    let _e43 = (*p)[1u];
    dxy = max(_e41, _e43);
    let _e46 = (*p)[1u];
    let _e48 = (*p)[2u];
    dyz = max(_e46, _e48);
    let _e51 = (*p)[2u];
    let _e53 = (*p)[0u];
    dzx = max(_e51, _e53);
    let _e55 = dxy;
    let _e56 = dyz;
    let _e57 = dzx;
    return (min(_e55, min(_e56, _e57)) - 1.0);
}

fn Cubevf3f1_(p_1: ptr<function, vec3<f32>>, s: ptr<function, f32>) -> f32 {
    let _e36 = (*p_1);
    (*p_1) = abs(_e36);
    let _e38 = (*p_1);
    let _e39 = (*s);
    return length(max((_e38 - vec3<f32>(_e39)), vec3<f32>(0.0)));
}

fn pmodvf2f1_(p_2: ptr<function, vec2<f32>>, n: ptr<function, f32>) -> vec2<f32> {
    var a: f32;
    var t: f32;

    let _e38 = (*n);
    a = (6.2831854820251465 / _e38);
    let _e41 = (*p_2)[0u];
    let _e43 = (*p_2)[1u];
    let _e45 = (*n);
    t = (atan2(_e41, _e43) - (3.1415927410125732 / _e45));
    let _e48 = t;
    let _e49 = a;
    let _e54 = (*n);
    t = ((_e48 - (floor((_e48 / _e49)) * _e49)) - (3.1415927410125732 / _e54));
    let _e57 = (*p_2);
    let _e59 = t;
    let _e62 = (*p_2);
    let _e64 = t;
    return vec2<f32>((length(_e57) * cos(_e59)), (length(_e62) * sin(_e64)));
}

fn mapvf3_(p_3: ptr<function, vec3<f32>>) -> f32 {
    var param: vec2<f32>;
    var param_1: f32;
    var k: f32;
    var s_1: f32;
    var d: f32;
    var param_2: vec3<f32>;
    var param_3: f32;
    var scale: f32;
    var i: i32;
    var param_4: vec3<f32>;

    let _e46 = fragUbo.time;
    let _e48 = (*p_3)[2u];
    (*p_3)[2u] = (_e48 + _e46);
    let _e51 = (*p_3);
    param = _e51.xy;
    let _e54 = fragUbo.pmodcount;
    param_1 = _e54;
    let _e55 = pmodvf2f1_((&param), (&param_1));
    (*p_3)[0u] = _e55.x;
    (*p_3)[1u] = _e55.y;
    k = 4.0;
    let _e60 = (*p_3);
    let _e61 = k;
    let _e62 = vec3<f32>(_e61);
    let _e67 = k;
    (*p_3) = ((_e60 - (floor((_e60 / _e62)) * _e62)) - vec3<f32>((0.5 * _e67)));
    s_1 = 2.0;
    let _e71 = (*p_3);
    param_2 = _e71;
    let _e72 = s_1;
    param_3 = _e72;
    let _e73 = Cubevf3f1_((&param_2), (&param_3));
    d = _e73;
    let _e75 = fragUbo.offset;
    scale = _e75;
    i = 0;
    loop {
        let _e76 = i;
        if (_e76 < 6) {
            let _e78 = (*p_3);
            let _e79 = vec3<f32>(2.0);
            (*p_3) = ((_e78 - (floor((_e78 / _e79)) * _e79)) - vec3<f32>(1.0));
            let _e86 = scale;
            let _e87 = s_1;
            s_1 = (_e87 * _e86);
            let _e89 = scale;
            let _e90 = (*p_3);
            (*p_3) = (vec3<f32>(1.0) - (abs(_e90) * _e89));
            let _e95 = d;
            let _e96 = (*p_3);
            param_4 = _e96;
            let _e97 = sdCrossvf3_((&param_4));
            let _e98 = s_1;
            d = max(_e95, (_e97 / _e98));
            let _e102 = fragUbo.rotyz;
            let _e105 = fragUbo.rotyz;
            let _e108 = fragUbo.rotyz;
            let _e112 = fragUbo.rotyz;
            let _e117 = (*p_3);
            let _e119 = (_e117.yz * mat2x2<f32>(vec2<f32>(cos(_e102), sin(_e105)), vec2<f32>(-(sin(_e108)), cos(_e112))));
            (*p_3)[1u] = _e119.x;
            (*p_3)[2u] = _e119.y;
            let _e125 = fragUbo.rotxz;
            let _e128 = fragUbo.rotxz;
            let _e131 = fragUbo.rotxz;
            let _e135 = fragUbo.rotxz;
            let _e140 = (*p_3);
            let _e142 = (_e140.xz * mat2x2<f32>(vec2<f32>(cos(_e125), sin(_e128)), vec2<f32>(-(sin(_e131)), cos(_e135))));
            (*p_3)[0u] = _e142.x;
            (*p_3)[2u] = _e142.y;
            continue;
        } else {
            break;
        }
        continuing {
            let _e147 = i;
            i = (_e147 + 1);
        }
    }
    let _e149 = d;
    return _e149;
}

fn main_1() {
    var col: vec3<f32>;
    var uv: vec2<f32>;
    var st: vec2<f32>;
    var ro: vec3<f32>;
    var rd: vec3<f32>;
    var d_1: f32;
    var t_1: f32;
    var acc: f32;
    var i_1: i32;
    var param_5: vec3<f32>;

    col = vec3<f32>(0.0, 0.0, 0.0);
    let _e45 = v2f_UV_1[0u];
    let _e47 = v2f_UV_1[1u];
    uv = vec2<f32>(_e45, (1.0 - _e47));
    let _e50 = uv;
    st = ((_e50 * 2.0) - vec2<f32>(1.0));
    let _e56 = fragUbo.resolution[0u];
    let _e59 = fragUbo.resolution[1u];
    let _e62 = st[0u];
    st[0u] = (_e62 * (_e56 / _e59));
    ro = vec3<f32>(0.0, 0.0, 1.0);
    let _e65 = st;
    rd = normalize(vec3<f32>(_e65.x, _e65.y, -1.0));
    d_1 = 1.0;
    t_1 = 0.0;
    acc = 0.0;
    i_1 = 0;
    loop {
        let _e70 = i_1;
        if (_e70 < 64) {
            let _e72 = ro;
            let _e73 = rd;
            let _e74 = t_1;
            param_5 = (_e72 + (_e73 * _e74));
            let _e77 = mapvf3_((&param_5));
            d_1 = _e77;
            let _e78 = d_1;
            if (_e78 < 9.999999747378752e-5) {
                break;
            }
            let _e80 = d_1;
            let _e81 = t_1;
            t_1 = (_e81 + _e80);
            let _e83 = d_1;
            let _e85 = acc;
            acc = (_e85 + exp(_e83));
            continue;
        } else {
            break;
        }
        continuing {
            let _e87 = i_1;
            i_1 = (_e87 + 1);
        }
    }
    let _e89 = t_1;
    col = vec3<f32>(exp((-0.5 * _e89)));
    let _e94 = fragUbo.baseColor;
    let _e96 = acc;
    let _e99 = col;
    col = (_e99 * ((_e94.xyz * _e96) * 0.03999999910593033));
    let _e101 = col;
    outColor = vec4<f32>(_e101.x, _e101.y, _e101.z, 1.0);
    return;
}

@fragment 
fn main(@location(0) v2f_UV: vec2<f32>) -> @location(0) vec4<f32> {
    v2f_UV_1 = v2f_UV;
    main_1();
    let _e3 = outColor;
    return _e3;
}
