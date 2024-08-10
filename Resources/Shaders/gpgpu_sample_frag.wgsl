var<private> fragColor_1: vec4<f32>;
var<private> outColor: vec4<f32>;
var<private> fragTexCoord_1: vec2<f32>;

fn main_1() {
    var col: vec3<f32>;

    col = vec3<f32>(0.0, 0.0, 0.0);
    let _e11 = fragColor_1;
    col = _e11.xyz;
    let _e13 = col;
    outColor = vec4<f32>(_e13.x, _e13.y, _e13.z, 0.5);
    return;
}

@fragment 
fn main(@location(1) fragColor: vec4<f32>, @location(0) fragTexCoord: vec2<f32>) -> @location(0) vec4<f32> {
    fragColor_1 = fragColor;
    fragTexCoord_1 = fragTexCoord;
    main_1();
    let _e5 = outColor;
    return _e5;
}
