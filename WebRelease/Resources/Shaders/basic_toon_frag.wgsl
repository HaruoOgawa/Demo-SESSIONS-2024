struct FragUniformBufferObject {
    lightDir: vec4<f32>,
    lightColor: vec4<f32>,
    cameraPos: vec4<f32>,
    diffuseFactor: vec4<f32>,
    ambientFactor: vec4<f32>,
    specularFactor: vec4<f32>,
    edgeColor: vec4<f32>,
    specularIntensity: f32,
    f_pad0_: f32,
    f_pad1_: f32,
    f_pad2_: f32,
    UseMainTexture: i32,
    UseToonTexture: i32,
    UseSphereTexture: i32,
    SphereMode: i32,
    drawPathIndex: i32,
    iPad0_: i32,
    iPad1_: i32,
    iPad2_: i32,
    mPad0_: mat4x4<f32>,
    mPad1_: mat4x4<f32>,
    mPad2_: mat4x4<f32>,
    mPad3_: mat4x4<f32>,
}

@group(0) @binding(2) 
var<uniform> fragUbo: FragUniformBufferObject;
var<private> f_WorldNormal_1: vec3<f32>;
var<private> f_WorldPos_1: vec4<f32>;
@group(0) @binding(3) 
var MainTexture: texture_2d<f32>;
@group(0) @binding(4) 
var MainTextureSampler: sampler;
var<private> f_Texcoord_1: vec2<f32>;
@group(0) @binding(7) 
var SphereTexture: texture_2d<f32>;
@group(0) @binding(8) 
var SphereTextureSampler: sampler;
var<private> f_SphereUV_1: vec2<f32>;
@group(0) @binding(5) 
var ToonTexture: texture_2d<f32>;
@group(0) @binding(6) 
var ToonTextureSampler: sampler;
var<private> outColor: vec4<f32>;
var<private> f_WorldTangent_1: vec3<f32>;
var<private> f_WorldBioTangent_1: vec3<f32>;
var<private> f_LightSpacePos_1: vec4<f32>;

fn main_1() {
    var col: vec3<f32>;
    var alpha: f32;
    var NdotL: f32;
    var v: vec3<f32>;
    var l: vec3<f32>;
    var HalfVector: vec3<f32>;
    var diffuseColor: vec4<f32>;
    var MainColor: vec4<f32>;
    var SphereColor: vec3<f32>;
    var ToonColor: vec3<f32>;
    var specularColor: vec3<f32>;

    col = vec3<f32>(1.0, 1.0, 1.0);
    alpha = 1.0;
    let _e50 = fragUbo.drawPathIndex;
    if (_e50 == 1) {
        let _e52 = f_WorldNormal_1;
        let _e54 = fragUbo.lightDir;
        NdotL = max(0.0, dot(_e52, -(_e54.xyz)));
        let _e60 = fragUbo.cameraPos;
        let _e62 = f_WorldPos_1;
        v = normalize((_e60.xyz - _e62.xyz));
        let _e67 = fragUbo.lightDir;
        l = (_e67.xyz * -1.0);
        let _e70 = v;
        let _e71 = l;
        HalfVector = normalize((_e70 + _e71));
        let _e75 = fragUbo.diffuseFactor;
        diffuseColor = _e75;
        let _e77 = fragUbo.UseToonTexture;
        if (_e77 == 0) {
        }
        let _e80 = fragUbo.UseMainTexture;
        if (_e80 != 0) {
            let _e82 = f_Texcoord_1;
            let _e83 = textureSample(MainTexture, MainTextureSampler, _e82);
            MainColor = _e83;
            let _e84 = MainColor;
            let _e85 = diffuseColor;
            diffuseColor = (_e85 * _e84);
        }
        let _e87 = diffuseColor;
        col = _e87.xyz;
        let _e90 = diffuseColor[3u];
        alpha = _e90;
        let _e92 = fragUbo.UseSphereTexture;
        if (_e92 != 0) {
            let _e94 = f_SphereUV_1;
            let _e95 = textureSample(SphereTexture, SphereTextureSampler, _e94);
            SphereColor = _e95.xyz;
            let _e98 = fragUbo.SphereMode;
            if (_e98 == 1) {
                let _e100 = SphereColor;
                let _e101 = col;
                col = (_e101 * _e100);
            } else {
                let _e104 = fragUbo.SphereMode;
                if (_e104 == 2) {
                    let _e106 = SphereColor;
                    let _e107 = col;
                    col = (_e107 + _e106);
                }
            }
        }
        let _e110 = fragUbo.UseToonTexture;
        if (_e110 != 0) {
            let _e112 = NdotL;
            let _e114 = textureSample(ToonTexture, ToonTextureSampler, vec2<f32>(0.0, _e112));
            ToonColor = _e114.xyz;
            let _e116 = ToonColor;
            let _e117 = NdotL;
            let _e123 = col;
            col = (_e123 * mix(_e116, vec3<f32>(1.0, 1.0, 1.0), vec3<f32>(clamp(((_e117 * 16.0) + 0.5), 0.0, 1.0))));
        }
        let _e126 = fragUbo.specularIntensity;
        if (_e126 > 0.0) {
            let _e129 = fragUbo.specularFactor;
            let _e131 = HalfVector;
            let _e132 = f_WorldNormal_1;
            let _e136 = fragUbo.specularIntensity;
            specularColor = (_e129.xyz * pow(max(0.0, dot(_e131, _e132)), _e136));
            let _e139 = specularColor;
            let _e140 = col;
            col = (_e140 + _e139);
        }
    } else {
        let _e143 = fragUbo.drawPathIndex;
        if (_e143 == 2) {
            let _e146 = fragUbo.edgeColor;
            col = _e146.xyz;
        }
    }
    let _e148 = col;
    let _e149 = alpha;
    outColor = vec4<f32>(_e148.x, _e148.y, _e148.z, _e149);
    return;
}

@fragment 
fn main(@location(0) f_WorldNormal: vec3<f32>, @location(2) f_WorldPos: vec4<f32>, @location(1) f_Texcoord: vec2<f32>, @location(6) f_SphereUV: vec2<f32>, @location(3) f_WorldTangent: vec3<f32>, @location(4) f_WorldBioTangent: vec3<f32>, @location(5) f_LightSpacePos: vec4<f32>) -> @location(0) vec4<f32> {
    f_WorldNormal_1 = f_WorldNormal;
    f_WorldPos_1 = f_WorldPos;
    f_Texcoord_1 = f_Texcoord;
    f_SphereUV_1 = f_SphereUV;
    f_WorldTangent_1 = f_WorldTangent;
    f_WorldBioTangent_1 = f_WorldBioTangent;
    f_LightSpacePos_1 = f_LightSpacePos;
    main_1();
    let _e15 = outColor;
    return _e15;
}
