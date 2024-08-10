struct PBRParam {
    NdotL: f32,
    NdotV: f32,
    NdotH: f32,
    LdotH: f32,
    VdotH: f32,
    perceptualRoughness: f32,
    metallic: f32,
    reflectance0_: vec3<f32>,
    reflectance90_: vec3<f32>,
    alphaRoughness: f32,
    diffuseColor: vec3<f32>,
    specularColor: vec3<f32>,
}

struct UniformBufferObject {
    model: mat4x4<f32>,
    view: mat4x4<f32>,
    proj: mat4x4<f32>,
    lightVPMat: mat4x4<f32>,
    lightDir: vec4<f32>,
    lightColor: vec4<f32>,
    cameraPos: vec4<f32>,
    baseColorFactor: vec4<f32>,
    emissiveFactor: vec4<f32>,
    time: f32,
    metallicFactor: f32,
    roughnessFactor: f32,
    normalMapScale: f32,
    occlusionStrength: f32,
    mipCount: f32,
    ShadowMapX: f32,
    ShadowMapY: f32,
    useBaseColorTexture: i32,
    useMetallicRoughnessTexture: i32,
    useEmissiveTexture: i32,
    useNormalTexture: i32,
    useOcclusionTexture: i32,
    t_pad_0_: i32,
    t_pad_1_: i32,
    t_pad_2_: i32,
}

@group(0) @binding(0) 
var<uniform> ubo: UniformBufferObject;
var<private> f_WorldTangent_1: vec3<f32>;
var<private> f_WorldBioTangent_1: vec3<f32>;
var<private> f_WorldNormal_1: vec3<f32>;
@group(0) @binding(7) 
var normalTexture: texture_2d<f32>;
@group(0) @binding(8) 
var normalTextureSampler: sampler;
var<private> f_Texcoord_1: vec2<f32>;
@group(0) @binding(13) 
var shadowmapTexture: texture_2d<f32>;
@group(0) @binding(14) 
var shadowmapTextureSampler: sampler;
@group(0) @binding(3) 
var metallicRoughnessTexture: texture_2d<f32>;
@group(0) @binding(4) 
var metallicRoughnessTextureSampler: sampler;
@group(0) @binding(1) 
var baseColorTexture: texture_2d<f32>;
@group(0) @binding(2) 
var baseColorTextureSampler: sampler;
var<private> f_WorldPos_1: vec4<f32>;
@group(0) @binding(11) 
var cubemapTexture: texture_cube<f32>;
@group(0) @binding(12) 
var cubemapTextureSampler: sampler;
@group(0) @binding(9) 
var occlusionTexture: texture_2d<f32>;
@group(0) @binding(10) 
var occlusionTextureSampler: sampler;
@group(0) @binding(5) 
var emissiveTexture: texture_2d<f32>;
@group(0) @binding(6) 
var emissiveTextureSampler: sampler;
var<private> f_LightSpacePos_1: vec4<f32>;
var<private> outColor: vec4<f32>;

fn ComputePCFvf2_(uv: ptr<function, vec2<f32>>) -> vec2<f32> {
    var moments: vec2<f32>;

    moments = vec2<f32>(0.0, 0.0);
    let _e72 = (*uv);
    let _e73 = textureSample(shadowmapTexture, shadowmapTextureSampler, _e72);
    moments = _e73.xy;
    let _e75 = moments;
    return _e75;
}

fn CalcShadowvf3vf3vf3_(lsp: ptr<function, vec3<f32>>, nomral: ptr<function, vec3<f32>>, lightDir: ptr<function, vec3<f32>>) -> f32 {
    var moments_1: vec2<f32>;
    var param: vec2<f32>;
    var ShadowBias: f32;
    var distance: f32;
    var variance: f32;
    var d: f32;
    var p_max: f32;

    let _e80 = (*lsp);
    param = _e80.xy;
    let _e82 = ComputePCFvf2_((&param));
    moments_1 = _e82;
    let _e83 = (*nomral);
    let _e84 = (*lightDir);
    ShadowBias = max(0.004999999888241291, (0.05000000074505806 * (1.0 - dot(_e83, _e84))));
    let _e90 = (*lsp)[2u];
    let _e91 = ShadowBias;
    distance = (_e90 - _e91);
    let _e93 = distance;
    let _e95 = moments_1[0u];
    if (_e93 <= _e95) {
        return 1.0;
    }
    let _e98 = moments_1[1u];
    let _e100 = moments_1[0u];
    let _e102 = moments_1[0u];
    variance = (_e98 - (_e100 * _e102));
    let _e105 = variance;
    variance = max(0.004999999888241291, _e105);
    let _e107 = distance;
    let _e109 = moments_1[0u];
    d = (_e107 - _e109);
    let _e111 = variance;
    let _e112 = variance;
    let _e113 = d;
    let _e114 = d;
    p_max = (_e111 / (_e112 + (_e113 * _e114)));
    let _e118 = p_max;
    return _e118;
}

fn SRGBtoLINEARvf4_(srgbIn: ptr<function, vec4<f32>>) -> vec4<f32> {
    let _e71 = (*srgbIn);
    let _e73 = pow(_e71.xyz, vec3<f32>(2.200000047683716, 2.200000047683716, 2.200000047683716));
    let _e75 = (*srgbIn)[3u];
    return vec4<f32>(_e73.x, _e73.y, _e73.z, _e75);
}

fn LINEARtoSRGBvf4_(srgbIn_1: ptr<function, vec4<f32>>) -> vec4<f32> {
    let _e71 = (*srgbIn_1);
    let _e73 = pow(_e71.xyz, vec3<f32>(0.4545454680919647, 0.4545454680919647, 0.4545454680919647));
    let _e75 = (*srgbIn_1)[3u];
    return vec4<f32>(_e73.x, _e73.y, _e73.z, _e75);
}

fn CalcDiffuseBRDFstructPBRParamf1f1f1f1f1f1f1vf3vf3f1vf3vf31_(param_1: ptr<function, PBRParam>) -> vec3<f32> {
    let _e72 = (*param_1).diffuseColor;
    return (_e72 / vec3<f32>(3.1415927410125732));
}

fn CalcFrenelReflectionstructPBRParamf1f1f1f1f1f1f1vf3vf3f1vf3vf31_(param_2: ptr<function, PBRParam>) -> vec3<f32> {
    let _e72 = (*param_2).reflectance0_;
    let _e74 = (*param_2).reflectance90_;
    let _e76 = (*param_2).reflectance0_;
    let _e79 = (*param_2).VdotH;
    return (_e72 + ((_e74 - _e76) * pow(clamp((1.0 - _e79), 0.0, 1.0), 5.0)));
}

fn CalcGeometricOcculusionstructPBRParamf1f1f1f1f1f1f1vf3vf3f1vf3vf31_(param_3: ptr<function, PBRParam>) -> f32 {
    var NdotL: f32;
    var NdotV: f32;
    var r: f32;
    var attenuationL: f32;
    var attenuationV: f32;

    let _e77 = (*param_3).NdotL;
    NdotL = _e77;
    let _e79 = (*param_3).NdotV;
    NdotV = _e79;
    let _e81 = (*param_3).alphaRoughness;
    r = _e81;
    let _e82 = NdotL;
    let _e84 = NdotL;
    let _e85 = r;
    let _e86 = r;
    let _e88 = r;
    let _e89 = r;
    let _e92 = NdotL;
    let _e93 = NdotL;
    attenuationL = ((2.0 * _e82) / (_e84 + sqrt(((_e85 * _e86) + ((1.0 - (_e88 * _e89)) * (_e92 * _e93))))));
    let _e100 = NdotV;
    let _e102 = NdotV;
    let _e103 = r;
    let _e104 = r;
    let _e106 = r;
    let _e107 = r;
    let _e110 = NdotV;
    let _e111 = NdotV;
    attenuationV = ((2.0 * _e100) / (_e102 + sqrt(((_e103 * _e104) + ((1.0 - (_e106 * _e107)) * (_e110 * _e111))))));
    let _e118 = attenuationL;
    let _e119 = attenuationV;
    return (_e118 * _e119);
}

fn CalcMicrofacetstructPBRParamf1f1f1f1f1f1f1vf3vf3f1vf3vf31_(param_4: ptr<function, PBRParam>) -> f32 {
    var roughness2_: f32;
    var f: f32;

    let _e74 = (*param_4).alphaRoughness;
    let _e76 = (*param_4).alphaRoughness;
    roughness2_ = (_e74 * _e76);
    let _e79 = (*param_4).NdotH;
    let _e80 = roughness2_;
    let _e83 = (*param_4).NdotH;
    let _e86 = (*param_4).NdotH;
    f = ((((_e79 * _e80) - _e83) * _e86) + 1.0);
    let _e89 = roughness2_;
    let _e90 = f;
    let _e92 = f;
    return (_e89 / ((3.1415927410125732 * _e90) * _e92));
}

fn getNormal() -> vec3<f32> {
    var nomral_1: vec3<f32>;
    var t: vec3<f32>;
    var b: vec3<f32>;
    var n: vec3<f32>;
    var tbn: mat3x3<f32>;

    nomral_1 = vec3<f32>(0.0, 0.0, 0.0);
    let _e76 = ubo.useNormalTexture;
    if (_e76 != 0) {
        let _e78 = f_WorldTangent_1;
        t = normalize(_e78);
        let _e80 = f_WorldBioTangent_1;
        b = normalize(_e80);
        let _e82 = f_WorldNormal_1;
        n = normalize(_e82);
        let _e84 = t;
        let _e85 = b;
        let _e86 = n;
        tbn = mat3x3<f32>(vec3<f32>(_e84.x, _e84.y, _e84.z), vec3<f32>(_e85.x, _e85.y, _e85.z), vec3<f32>(_e86.x, _e86.y, _e86.z));
        let _e100 = f_Texcoord_1;
        let _e101 = textureSample(normalTexture, normalTextureSampler, _e100);
        nomral_1 = _e101.xyz;
        let _e103 = tbn;
        let _e104 = nomral_1;
        let _e109 = ubo.normalMapScale;
        let _e111 = ubo.normalMapScale;
        nomral_1 = normalize((_e103 * (((_e104 * 2.0) - vec3<f32>(1.0)) * vec3<f32>(_e109, _e111, 1.0))));
    } else {
        let _e116 = f_WorldNormal_1;
        nomral_1 = _e116;
    }
    let _e117 = nomral_1;
    return _e117;
}

fn main_1() {
    var col: vec4<f32>;
    var perceptualRoughness: f32;
    var metallic: f32;
    var metallicRoughnessColor: vec4<f32>;
    var alphaRoughness: f32;
    var baseColor: vec4<f32>;
    var f0_: vec3<f32>;
    var diffuseColor: vec3<f32>;
    var specularColor: vec3<f32>;
    var reflectance: f32;
    var reflectance90_: f32;
    var specularEnvironmentR0_: vec3<f32>;
    var specularEnvironmentR90_: vec3<f32>;
    var n_1: vec3<f32>;
    var v: vec3<f32>;
    var l: vec3<f32>;
    var h: vec3<f32>;
    var reflection: vec3<f32>;
    var NdotL_1: f32;
    var NdotV_1: f32;
    var NdotH: f32;
    var LdotH: f32;
    var VdotH: f32;
    var pbrParam: PBRParam;
    var D: f32;
    var param_5: PBRParam;
    var G: f32;
    var param_6: PBRParam;
    var F: vec3<f32>;
    var param_7: PBRParam;
    var specularBRDF: vec3<f32>;
    var diffuseBRDF: vec3<f32>;
    var param_8: PBRParam;
    var mipCount: f32;
    var lod: f32;
    var reflectColor: vec3<f32>;
    var param_9: vec4<f32>;
    var ao: f32;
    var emissive: vec3<f32>;
    var param_10: vec4<f32>;
    var lsp_1: vec3<f32>;
    var shadowCol: f32;
    var outSide: bool;
    var param_11: vec3<f32>;
    var param_12: vec3<f32>;
    var param_13: vec3<f32>;
    var phi_682_: bool;
    var phi_683_: bool;
    var phi_696_: bool;
    var phi_697_: bool;

    col = vec4<f32>(1.0, 1.0, 1.0, 1.0);
    let _e117 = ubo.roughnessFactor;
    perceptualRoughness = _e117;
    let _e119 = ubo.metallicFactor;
    metallic = _e119;
    let _e121 = ubo.useMetallicRoughnessTexture;
    if (_e121 != 0) {
        let _e123 = f_Texcoord_1;
        let _e124 = textureSample(metallicRoughnessTexture, metallicRoughnessTextureSampler, _e123);
        metallicRoughnessColor = _e124;
        let _e125 = perceptualRoughness;
        let _e127 = metallicRoughnessColor[1u];
        perceptualRoughness = (_e125 * _e127);
        let _e129 = metallic;
        let _e131 = metallicRoughnessColor[2u];
        metallic = (_e129 * _e131);
    }
    let _e133 = perceptualRoughness;
    perceptualRoughness = clamp(_e133, 0.03999999910593033, 1.0);
    let _e135 = metallic;
    metallic = clamp(_e135, 0.0, 1.0);
    let _e137 = perceptualRoughness;
    let _e138 = perceptualRoughness;
    alphaRoughness = (_e137 * _e138);
    let _e141 = ubo.useBaseColorTexture;
    if (_e141 != 0) {
        let _e143 = f_Texcoord_1;
        let _e144 = textureSample(baseColorTexture, baseColorTextureSampler, _e143);
        baseColor = _e144;
    } else {
        let _e146 = ubo.baseColorFactor;
        baseColor = _e146;
    }
    f0_ = vec3<f32>(0.03999999910593033, 0.03999999910593033, 0.03999999910593033);
    let _e147 = baseColor;
    let _e149 = f0_;
    diffuseColor = (_e147.xyz * (vec3<f32>(1.0, 1.0, 1.0) - _e149));
    let _e152 = metallic;
    let _e154 = diffuseColor;
    diffuseColor = (_e154 * (1.0 - _e152));
    let _e156 = f0_;
    let _e157 = baseColor;
    let _e159 = metallic;
    specularColor = mix(_e156, _e157.xyz, vec3<f32>(_e159));
    let _e163 = specularColor[0u];
    let _e165 = specularColor[1u];
    let _e168 = specularColor[2u];
    reflectance = max(max(_e163, _e165), _e168);
    let _e170 = reflectance;
    reflectance90_ = clamp((_e170 * 25.0), 0.0, 1.0);
    let _e173 = specularColor;
    specularEnvironmentR0_ = _e173;
    let _e174 = reflectance90_;
    specularEnvironmentR90_ = (vec3<f32>(1.0, 1.0, 1.0) * _e174);
    let _e176 = getNormal();
    n_1 = _e176;
    let _e178 = ubo.cameraPos;
    let _e180 = f_WorldPos_1;
    v = normalize((_e178.xyz - _e180.xyz));
    let _e185 = ubo.lightDir;
    l = normalize(_e185.xyz);
    let _e188 = v;
    let _e189 = l;
    h = normalize((_e188 + _e189));
    let _e192 = v;
    let _e193 = n_1;
    reflection = -(normalize(reflect(_e192, _e193)));
    let _e197 = n_1;
    let _e198 = l;
    NdotL_1 = clamp(dot(_e197, _e198), 0.0010000000474974513, 1.0);
    let _e201 = n_1;
    let _e202 = v;
    NdotV_1 = clamp(abs(dot(_e201, _e202)), 0.0010000000474974513, 1.0);
    let _e206 = n_1;
    let _e207 = h;
    NdotH = clamp(dot(_e206, _e207), 0.0, 1.0);
    let _e210 = l;
    let _e211 = h;
    LdotH = clamp(dot(_e210, _e211), 0.0, 1.0);
    let _e214 = v;
    let _e215 = h;
    VdotH = clamp(dot(_e214, _e215), 0.0, 1.0);
    let _e218 = NdotL_1;
    let _e219 = NdotV_1;
    let _e220 = NdotH;
    let _e221 = LdotH;
    let _e222 = VdotH;
    let _e223 = perceptualRoughness;
    let _e224 = metallic;
    let _e225 = specularEnvironmentR0_;
    let _e226 = specularEnvironmentR90_;
    let _e227 = alphaRoughness;
    let _e228 = diffuseColor;
    let _e229 = specularColor;
    pbrParam = PBRParam(_e218, _e219, _e220, _e221, _e222, _e223, _e224, _e225, _e226, _e227, _e228, _e229);
    let _e231 = pbrParam;
    param_5 = _e231;
    let _e232 = CalcMicrofacetstructPBRParamf1f1f1f1f1f1f1vf3vf3f1vf3vf31_((&param_5));
    D = _e232;
    let _e233 = pbrParam;
    param_6 = _e233;
    let _e234 = CalcGeometricOcculusionstructPBRParamf1f1f1f1f1f1f1vf3vf3f1vf3vf31_((&param_6));
    G = _e234;
    let _e235 = pbrParam;
    param_7 = _e235;
    let _e236 = CalcFrenelReflectionstructPBRParamf1f1f1f1f1f1f1vf3vf3f1vf3vf31_((&param_7));
    F = _e236;
    let _e237 = D;
    let _e238 = G;
    let _e240 = F;
    let _e242 = NdotL_1;
    let _e244 = NdotV_1;
    specularBRDF = ((_e240 * (_e237 * _e238)) / vec3<f32>(((4.0 * _e242) * _e244)));
    let _e248 = F;
    let _e251 = pbrParam;
    param_8 = _e251;
    let _e252 = CalcDiffuseBRDFstructPBRParamf1f1f1f1f1f1f1vf3vf3f1vf3vf31_((&param_8));
    diffuseBRDF = ((vec3<f32>(1.0) - _e248) * _e252);
    let _e255 = ubo.mipCount;
    mipCount = _e255;
    let _e256 = mipCount;
    let _e257 = perceptualRoughness;
    lod = (_e256 * _e257);
    let _e259 = v;
    let _e260 = n_1;
    let _e262 = lod;
    let _e263 = textureSampleLevel(cubemapTexture, cubemapTextureSampler, reflect(_e259, _e260), _e262);
    param_9 = _e263;
    let _e264 = LINEARtoSRGBvf4_((&param_9));
    reflectColor = _e264.xyz;
    let _e266 = NdotL_1;
    let _e268 = ubo.lightColor;
    let _e271 = specularBRDF;
    let _e272 = diffuseBRDF;
    let _e275 = reflectColor;
    let _e276 = specularColor;
    let _e278 = (((_e268.xyz * _e266) * (_e271 + _e272)) + (_e275 * _e276));
    col[0u] = _e278.x;
    col[1u] = _e278.y;
    col[2u] = _e278.z;
    let _e286 = ubo.useOcclusionTexture;
    if (_e286 != 0) {
        let _e288 = f_Texcoord_1;
        let _e289 = textureSample(occlusionTexture, occlusionTextureSampler, _e288);
        ao = _e289.x;
        let _e291 = col;
        let _e293 = col;
        let _e295 = ao;
        let _e298 = ubo.occlusionStrength;
        let _e300 = mix(_e291.xyz, (_e293.xyz * _e295), vec3<f32>(_e298));
        col[0u] = _e300.x;
        col[1u] = _e300.y;
        col[2u] = _e300.z;
    }
    let _e308 = ubo.useEmissiveTexture;
    if (_e308 != 0) {
        let _e310 = f_Texcoord_1;
        let _e311 = textureSample(emissiveTexture, emissiveTextureSampler, _e310);
        param_10 = _e311;
        let _e312 = SRGBtoLINEARvf4_((&param_10));
        let _e315 = ubo.emissiveFactor;
        emissive = (_e312.xyz * _e315.xyz);
        let _e318 = emissive;
        let _e319 = col;
        let _e321 = (_e319.xyz + _e318);
        col[0u] = _e321.x;
        col[1u] = _e321.y;
        col[2u] = _e321.z;
    }
    let _e328 = f_LightSpacePos_1;
    let _e331 = f_LightSpacePos_1[3u];
    lsp_1 = (_e328.xyz / vec3<f32>(_e331));
    let _e334 = lsp_1;
    lsp_1 = ((_e334 * 0.5) + vec3<f32>(0.5));
    shadowCol = 1.0;
    let _e339 = f_LightSpacePos_1[2u];
    let _e340 = (_e339 <= 0.0);
    phi_683_ = _e340;
    if !(_e340) {
        let _e343 = lsp_1[0u];
        let _e344 = (_e343 < 0.0);
        phi_682_ = _e344;
        if !(_e344) {
            let _e347 = lsp_1[1u];
            phi_682_ = (_e347 < 0.0);
        }
        let _e350 = phi_682_;
        phi_683_ = _e350;
    }
    let _e352 = phi_683_;
    phi_697_ = _e352;
    if !(_e352) {
        let _e355 = lsp_1[0u];
        let _e356 = (_e355 > 1.0);
        phi_696_ = _e356;
        if !(_e356) {
            let _e359 = lsp_1[1u];
            phi_696_ = (_e359 > 1.0);
        }
        let _e362 = phi_696_;
        phi_697_ = _e362;
    }
    let _e364 = phi_697_;
    outSide = _e364;
    let _e365 = outSide;
    if !(_e365) {
        let _e367 = lsp_1;
        param_11 = _e367;
        let _e368 = n_1;
        param_12 = _e368;
        let _e369 = l;
        param_13 = _e369;
        let _e370 = CalcShadowvf3vf3vf3_((&param_11), (&param_12), (&param_13));
        shadowCol = _e370;
    }
    let _e371 = shadowCol;
    let _e372 = col;
    let _e374 = (_e372.xyz * _e371);
    col[0u] = _e374.x;
    col[1u] = _e374.y;
    col[2u] = _e374.z;
    let _e381 = col;
    let _e383 = pow(_e381.xyz, vec3<f32>(0.4545454680919647, 0.4545454680919647, 0.4545454680919647));
    col[0u] = _e383.x;
    col[1u] = _e383.y;
    col[2u] = _e383.z;
    let _e391 = baseColor[3u];
    col[3u] = _e391;
    let _e393 = col;
    outColor = _e393;
    return;
}

@fragment 
fn main(@location(3) f_WorldTangent: vec3<f32>, @location(4) f_WorldBioTangent: vec3<f32>, @location(0) f_WorldNormal: vec3<f32>, @location(1) f_Texcoord: vec2<f32>, @location(2) f_WorldPos: vec4<f32>, @location(5) f_LightSpacePos: vec4<f32>) -> @location(0) vec4<f32> {
    f_WorldTangent_1 = f_WorldTangent;
    f_WorldBioTangent_1 = f_WorldBioTangent;
    f_WorldNormal_1 = f_WorldNormal;
    f_Texcoord_1 = f_Texcoord;
    f_WorldPos_1 = f_WorldPos;
    f_LightSpacePos_1 = f_LightSpacePos;
    main_1();
    let _e13 = outColor;
    return _e13;
}
