@group(0) @binding(1) 
var depthMap: texture_2d<f32>;
@group(0) @binding(2) 
var depthSampler: sampler;
var<private> fragTexCoord_1: vec2<f32>;
var<private> outColor: vec4<f32>;

fn main_1() {
    var depth: f32;

    let _e13 = fragTexCoord_1[0u];
    let _e15 = fragTexCoord_1[1u];
    let _e18 = textureSample(depthMap, depthSampler, vec2<f32>(_e13, (1.0 - _e15)));
    depth = _e18.x;
    let _e20 = depth;
    let _e21 = vec3<f32>(_e20);
    outColor = vec4<f32>(_e21.x, _e21.y, _e21.z, 1.0);
    return;
}

@fragment 
fn main(@location(0) fragTexCoord: vec2<f32>) -> @location(0) vec4<f32> {
    fragTexCoord_1 = fragTexCoord;
    main_1();
    let _e3 = outColor;
    return _e3;
}
