struct UniformBufferObject {
    rate: f32,
    time: f32,
    alpha: f32,
    pad: f32,
}

var<private> fragTexCoord_1: vec2<f32>;
@group(0) @binding(0) 
var<uniform> ubo: UniformBufferObject;
var<private> outColor: vec4<f32>;

fn main_1() {
    var uv: vec2<f32>;
    var st: vec2<f32>;
    var pad: vec2<f32>;
    var col: vec3<f32>;
    var w: f32;
    var phi_54_: bool;
    var phi_61_: bool;
    var phi_67_: bool;

    let _e31 = fragTexCoord_1;
    uv = _e31;
    let _e32 = fragTexCoord_1;
    st = ((_e32 * 2.0) - vec2<f32>(1.0));
    pad = vec2<f32>(0.20000000298023224, 0.47999998927116394);
    let _e36 = uv;
    let _e37 = pad;
    let _e39 = pad;
    let _e44 = (vec2<f32>(1.0) / (vec2<f32>(1.0) - (_e39 * 2.0)));
    uv = ((_e36 - _e37) * vec2<f32>(_e44.x, _e44.y));
    col = vec3<f32>(0.0, 0.0, 0.0);
    let _e50 = uv[0u];
    let _e51 = (_e50 >= 0.0);
    phi_54_ = _e51;
    if _e51 {
        let _e53 = uv[0u];
        phi_54_ = (_e53 <= 1.0);
    }
    let _e56 = phi_54_;
    phi_61_ = _e56;
    if _e56 {
        let _e58 = uv[1u];
        phi_61_ = (_e58 >= 0.0);
    }
    let _e61 = phi_61_;
    phi_67_ = _e61;
    if _e61 {
        let _e63 = uv[1u];
        phi_67_ = (_e63 <= 1.0);
    }
    let _e66 = phi_67_;
    if _e66 {
        let _e68 = uv[0u];
        let _e70 = ubo.rate;
        if (_e68 <= _e70) {
            let _e73 = uv[0u];
            col = mix(vec3<f32>(0.10000000149011612, 0.10000000149011612, 0.10000000149011612), vec3<f32>(1.0, 1.0, 1.0), vec3<f32>(_e73));
        } else {
            col = vec3<f32>(0.10000000149011612, 0.10000000149011612, 0.10000000149011612);
        }
    } else {
        w = 0.03999999910593033;
        let _e76 = st;
        let _e78 = w;
        let _e81 = w;
        if (length(max(vec2<f32>(0.0, 0.0), (abs(_e76) - vec2<f32>((0.5 + (_e78 * 2.3499999046325684)), _e81)))) <= 0.009999999776482582) {
            let _e87 = col;
            col = (_e87 + vec3<f32>(1.0, 1.0, 1.0));
        }
    }
    let _e89 = col;
    let _e91 = ubo.alpha;
    outColor = vec4<f32>(_e89.x, _e89.y, _e89.z, _e91);
    return;
}

@fragment 
fn main(@location(0) fragTexCoord: vec2<f32>) -> @location(0) vec4<f32> {
    fragTexCoord_1 = fragTexCoord;
    main_1();
    let _e3 = outColor;
    return _e3;
}
