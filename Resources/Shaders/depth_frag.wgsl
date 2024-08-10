var<private> fragPos_1: vec4<f32>;
var<private> outColor: vec4<f32>;

fn main_1() {
    var depth: f32;
    var moment1_: f32;
    var moment2_: f32;
    var dx: f32;
    var dy: f32;

    let _e18 = fragPos_1[2u];
    let _e20 = fragPos_1[3u];
    depth = (_e18 / _e20);
    let _e22 = depth;
    depth = ((_e22 * 0.5) + 0.5);
    let _e25 = depth;
    moment1_ = _e25;
    let _e26 = depth;
    let _e27 = depth;
    moment2_ = (_e26 * _e27);
    let _e29 = depth;
    let _e30 = dpdx(_e29);
    dx = _e30;
    let _e31 = depth;
    let _e32 = dpdy(_e31);
    dy = _e32;
    let _e33 = dx;
    let _e34 = dx;
    let _e36 = dy;
    let _e37 = dy;
    let _e41 = moment2_;
    moment2_ = (_e41 + (0.25 * ((_e33 * _e34) + (_e36 * _e37))));
    let _e43 = moment1_;
    let _e44 = moment2_;
    outColor = vec4<f32>(_e43, _e44, 0.0, 1.0);
    return;
}

@fragment 
fn main(@location(0) fragPos: vec4<f32>) -> @location(0) vec4<f32> {
    fragPos_1 = fragPos;
    main_1();
    let _e3 = outColor;
    return _e3;
}
