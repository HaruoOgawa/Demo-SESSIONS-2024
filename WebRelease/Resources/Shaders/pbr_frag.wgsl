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
    useCubeMap: i32,
    useShadowMap: i32,
    useIBL: i32,
    useSkinMeshAnimation: i32,
    useDirCubemap: i32,
    pad1_: i32,
    pad2_: i32,
}

@group(0) @binding(0) 
var<uniform> ubo: UniformBufferObject;
var<private> f_WorldTangent_1: vec3<f32>;
var<private> f_WorldBioTangent_1: vec3<f32>;
var<private> f_WorldNormal_1: vec3<f32>;
@group(0) @binding(8) 
var normalTexture: texture_2d<f32>;
@group(0) @binding(9) 
var normalTextureSampler: sampler;
var<private> f_Texcoord_1: vec2<f32>;
@group(0) @binding(14) 
var shadowmapTexture: texture_2d<f32>;
@group(0) @binding(15) 
var shadowmapTextureSampler: sampler;
@group(0) @binding(12) 
var cubemapTexture: texture_cube<f32>;
@group(0) @binding(13) 
var cubemapTextureSampler: sampler;
@group(0) @binding(22) 
var cubeMap2DTexture: texture_2d<f32>;
@group(0) @binding(23) 
var cubeMap2DTextureSampler: sampler;
@group(0) @binding(20) 
var IBL_GGXLUT_Texture: texture_2d<f32>;
@group(0) @binding(21) 
var IBL_GGXLUT_TextureSampler: sampler;
@group(0) @binding(16) 
var IBL_Diffuse_Texture: texture_2d<f32>;
@group(0) @binding(17) 
var IBL_Diffuse_TextureSampler: sampler;
@group(0) @binding(18) 
var IBL_Specular_Texture: texture_2d<f32>;
@group(0) @binding(19) 
var IBL_Specular_TextureSampler: sampler;
@group(0) @binding(4) 
var metallicRoughnessTexture: texture_2d<f32>;
@group(0) @binding(5) 
var metallicRoughnessTextureSampler: sampler;
@group(0) @binding(2) 
var baseColorTexture: texture_2d<f32>;
@group(0) @binding(3) 
var baseColorTextureSampler: sampler;
var<private> f_WorldPos_1: vec4<f32>;
@group(0) @binding(10) 
var occlusionTexture: texture_2d<f32>;
@group(0) @binding(11) 
var occlusionTextureSampler: sampler;
@group(0) @binding(6) 
var emissiveTexture: texture_2d<f32>;
@group(0) @binding(7) 
var emissiveTextureSampler: sampler;
var<private> f_LightSpacePos_1: vec4<f32>;
var<private> outColor: vec4<f32>;

fn ComputePCFvf2_(uv: ptr<function, vec2<f32>>) -> vec2<f32> {
    var moments: vec2<f32>;
    var texelSize: vec2<f32>;

    moments = vec2<f32>(0.0, 0.0);
    let _e98 = ubo.ShadowMapX;
    let _e101 = ubo.ShadowMapY;
    texelSize = vec2<f32>((1.0 / _e98), (1.0 / _e101));
    let _e104 = (*uv);
    let _e105 = texelSize;
    let _e108 = textureSample(shadowmapTexture, shadowmapTextureSampler, (_e104 + (vec2<f32>(-1.0, -1.0) * _e105)));
    let _e110 = moments;
    moments = (_e110 + _e108.xy);
    let _e112 = (*uv);
    let _e113 = texelSize;
    let _e116 = textureSample(shadowmapTexture, shadowmapTextureSampler, (_e112 + (vec2<f32>(-1.0, 0.0) * _e113)));
    let _e118 = moments;
    moments = (_e118 + _e116.xy);
    let _e120 = (*uv);
    let _e121 = texelSize;
    let _e124 = textureSample(shadowmapTexture, shadowmapTextureSampler, (_e120 + (vec2<f32>(-1.0, 1.0) * _e121)));
    let _e126 = moments;
    moments = (_e126 + _e124.xy);
    let _e128 = (*uv);
    let _e129 = texelSize;
    let _e132 = textureSample(shadowmapTexture, shadowmapTextureSampler, (_e128 + (vec2<f32>(0.0, -1.0) * _e129)));
    let _e134 = moments;
    moments = (_e134 + _e132.xy);
    let _e136 = (*uv);
    let _e137 = texelSize;
    let _e140 = textureSample(shadowmapTexture, shadowmapTextureSampler, (_e136 + (vec2<f32>(0.0, 0.0) * _e137)));
    let _e142 = moments;
    moments = (_e142 + _e140.xy);
    let _e144 = (*uv);
    let _e145 = texelSize;
    let _e148 = textureSample(shadowmapTexture, shadowmapTextureSampler, (_e144 + (vec2<f32>(0.0, 1.0) * _e145)));
    let _e150 = moments;
    moments = (_e150 + _e148.xy);
    let _e152 = (*uv);
    let _e153 = texelSize;
    let _e156 = textureSample(shadowmapTexture, shadowmapTextureSampler, (_e152 + (vec2<f32>(1.0, -1.0) * _e153)));
    let _e158 = moments;
    moments = (_e158 + _e156.xy);
    let _e160 = (*uv);
    let _e161 = texelSize;
    let _e164 = textureSample(shadowmapTexture, shadowmapTextureSampler, (_e160 + (vec2<f32>(1.0, 0.0) * _e161)));
    let _e166 = moments;
    moments = (_e166 + _e164.xy);
    let _e168 = (*uv);
    let _e169 = texelSize;
    let _e172 = textureSample(shadowmapTexture, shadowmapTextureSampler, (_e168 + (vec2<f32>(1.0, 1.0) * _e169)));
    let _e174 = moments;
    moments = (_e174 + _e172.xy);
    let _e176 = moments;
    moments = (_e176 / vec2<f32>(9.0));
    let _e179 = moments;
    return _e179;
}

fn CalcShadowvf3vf3vf3_(lsp: ptr<function, vec3<f32>>, nomral: ptr<function, vec3<f32>>, lightDir: ptr<function, vec3<f32>>) -> f32 {
    var moments_1: vec2<f32>;
    var param: vec2<f32>;
    var ShadowBias: f32;
    var distance: f32;
    var variance: f32;
    var d: f32;
    var p_max: f32;

    let _e104 = (*lsp);
    param = _e104.xy;
    let _e106 = ComputePCFvf2_((&param));
    moments_1 = _e106;
    let _e107 = (*nomral);
    let _e108 = (*lightDir);
    ShadowBias = max(0.004999999888241291, (0.05000000074505806 * (1.0 - dot(_e107, _e108))));
    let _e114 = (*lsp)[2u];
    let _e115 = ShadowBias;
    distance = (_e114 - _e115);
    let _e117 = distance;
    let _e119 = moments_1[0u];
    if (_e117 <= _e119) {
        return 1.0;
    }
    let _e122 = moments_1[1u];
    let _e124 = moments_1[0u];
    let _e126 = moments_1[0u];
    variance = (_e122 - (_e124 * _e126));
    let _e129 = variance;
    variance = max(0.004999999888241291, _e129);
    let _e131 = distance;
    let _e133 = moments_1[0u];
    d = (_e131 - _e133);
    let _e135 = variance;
    let _e136 = variance;
    let _e137 = d;
    let _e138 = d;
    p_max = (_e135 / (_e136 + (_e137 * _e138)));
    let _e142 = p_max;
    return _e142;
}

fn SRGBtoLINEARvf4_(srgbIn: ptr<function, vec4<f32>>) -> vec4<f32> {
    let _e95 = (*srgbIn);
    let _e97 = pow(_e95.xyz, vec3<f32>(2.200000047683716, 2.200000047683716, 2.200000047683716));
    let _e99 = (*srgbIn)[3u];
    return vec4<f32>(_e97.x, _e97.y, _e97.z, _e99);
}

fn CastDirToStvf3_(Dir: ptr<function, vec3<f32>>) -> vec2<f32> {
    var pi: f32;
    var theta: f32;
    var phi: f32;
    var st: vec2<f32>;

    pi = 3.1414999961853027;
    let _e100 = (*Dir)[1u];
    theta = acos(_e100);
    let _e103 = (*Dir)[2u];
    let _e105 = (*Dir)[0u];
    phi = atan2(_e103, _e105);
    let _e107 = phi;
    let _e108 = pi;
    let _e111 = theta;
    let _e112 = pi;
    st = vec2<f32>((_e107 / (2.0 * _e108)), (_e111 / _e112));
    let _e115 = st;
    return _e115;
}

fn LINEARtoSRGBvf4_(srgbIn_1: ptr<function, vec4<f32>>) -> vec4<f32> {
    let _e95 = (*srgbIn_1);
    let _e97 = pow(_e95.xyz, vec3<f32>(0.4545454680919647, 0.4545454680919647, 0.4545454680919647));
    let _e99 = (*srgbIn_1)[3u];
    return vec4<f32>(_e97.x, _e97.y, _e97.z, _e99);
}

fn ComputeReflectionColorstructPBRParamf1f1f1f1f1f1f1vf3vf3f1vf3vf31vf3vf3_(pbrParam: ptr<function, PBRParam>, v: ptr<function, vec3<f32>>, n: ptr<function, vec3<f32>>) -> vec3<f32> {
    var reflectColor: vec3<f32>;
    var mipCount: f32;
    var lod: f32;
    var param_1: vec4<f32>;
    var st_1: vec2<f32>;
    var param_2: vec3<f32>;
    var mipCount_1: f32;
    var lod_1: f32;
    var param_3: vec4<f32>;

    reflectColor = vec3<f32>(0.0, 0.0, 0.0);
    let _e107 = ubo.useCubeMap;
    if (_e107 != 0) {
        let _e110 = ubo.mipCount;
        mipCount = _e110;
        let _e111 = mipCount;
        let _e113 = (*pbrParam).perceptualRoughness;
        lod = (_e111 * _e113);
        let _e115 = (*v);
        let _e116 = (*n);
        let _e118 = lod;
        let _e119 = textureSampleLevel(cubemapTexture, cubemapTextureSampler, reflect(_e115, _e116), _e118);
        param_1 = _e119;
        let _e120 = LINEARtoSRGBvf4_((&param_1));
        reflectColor = _e120.xyz;
    } else {
        let _e123 = ubo.useDirCubemap;
        if (_e123 != 0) {
            let _e125 = (*v);
            let _e126 = (*n);
            param_2 = reflect(_e125, _e126);
            let _e128 = CastDirToStvf3_((&param_2));
            st_1 = _e128;
            let _e130 = ubo.mipCount;
            mipCount_1 = _e130;
            let _e131 = mipCount_1;
            let _e133 = (*pbrParam).perceptualRoughness;
            lod_1 = (_e131 * _e133);
            let _e135 = st_1;
            let _e136 = lod_1;
            let _e137 = textureSampleLevel(cubeMap2DTexture, cubeMap2DTextureSampler, _e135, _e136);
            param_3 = _e137;
            let _e138 = LINEARtoSRGBvf4_((&param_3));
            reflectColor = _e138.xyz;
        }
    }
    let _e140 = reflectColor;
    return _e140;
}

fn GetSphericalTexcoordvf3_(Dir_1: ptr<function, vec3<f32>>) -> vec2<f32> {
    var pi_1: f32;
    var theta_1: f32;
    var phi_1: f32;
    var st_2: vec2<f32>;

    pi_1 = 3.1414999961853027;
    let _e100 = (*Dir_1)[1u];
    theta_1 = acos(_e100);
    let _e103 = (*Dir_1)[2u];
    let _e105 = (*Dir_1)[0u];
    phi_1 = atan2(_e103, _e105);
    let _e107 = phi_1;
    let _e108 = pi_1;
    let _e111 = theta_1;
    let _e112 = pi_1;
    st_2 = vec2<f32>((_e107 / (2.0 * _e108)), (_e111 / _e112));
    let _e115 = st_2;
    return _e115;
}

fn ComputeIBLstructPBRParamf1f1f1f1f1f1f1vf3vf3f1vf3vf31vf3vf3_(pbrParam_1: ptr<function, PBRParam>, v_1: ptr<function, vec3<f32>>, n_1: ptr<function, vec3<f32>>) -> vec3<f32> {
    var mipCount_2: f32;
    var lod_2: f32;
    var brdf: vec3<f32>;
    var param_4: vec4<f32>;
    var diffuseLight: vec3<f32>;
    var param_5: vec3<f32>;
    var param_6: vec4<f32>;
    var specularLight: vec3<f32>;
    var param_7: vec3<f32>;
    var param_8: vec4<f32>;
    var diffuse: vec3<f32>;
    var specular: vec3<f32>;

    let _e110 = ubo.mipCount;
    mipCount_2 = _e110;
    let _e111 = mipCount_2;
    let _e113 = (*pbrParam_1).perceptualRoughness;
    lod_2 = (_e111 * _e113);
    let _e116 = (*pbrParam_1).NdotV;
    let _e118 = (*pbrParam_1).perceptualRoughness;
    let _e121 = textureSample(IBL_GGXLUT_Texture, IBL_GGXLUT_TextureSampler, vec2<f32>(_e116, (1.0 - _e118)));
    param_4 = _e121;
    let _e122 = SRGBtoLINEARvf4_((&param_4));
    brdf = _e122.xyz;
    let _e124 = (*n_1);
    param_5 = _e124;
    let _e125 = GetSphericalTexcoordvf3_((&param_5));
    let _e126 = textureSample(IBL_Diffuse_Texture, IBL_Diffuse_TextureSampler, _e125);
    param_6 = _e126;
    let _e127 = SRGBtoLINEARvf4_((&param_6));
    diffuseLight = _e127.xyz;
    let _e129 = (*v_1);
    let _e130 = (*n_1);
    param_7 = reflect(_e129, _e130);
    let _e132 = GetSphericalTexcoordvf3_((&param_7));
    let _e133 = lod_2;
    let _e134 = textureSampleLevel(IBL_Specular_Texture, IBL_Specular_TextureSampler, _e132, _e133);
    param_8 = _e134;
    let _e135 = SRGBtoLINEARvf4_((&param_8));
    specularLight = _e135.xyz;
    let _e137 = diffuseLight;
    let _e139 = (*pbrParam_1).diffuseColor;
    diffuse = (_e137 * _e139);
    let _e141 = specularLight;
    let _e143 = (*pbrParam_1).specularColor;
    let _e145 = brdf[0u];
    let _e148 = brdf[1u];
    specular = (_e141 * ((_e143 * _e145) + vec3<f32>(_e148)));
    let _e152 = diffuse;
    let _e153 = specular;
    return (_e152 + _e153);
}

fn CalcDiffuseBRDFstructPBRParamf1f1f1f1f1f1f1vf3vf3f1vf3vf31_(param_9: ptr<function, PBRParam>) -> vec3<f32> {
    let _e96 = (*param_9).diffuseColor;
    return (_e96 / vec3<f32>(3.1415927410125732));
}

fn CalcFrenelReflectionstructPBRParamf1f1f1f1f1f1f1vf3vf3f1vf3vf31_(param_10: ptr<function, PBRParam>) -> vec3<f32> {
    let _e96 = (*param_10).reflectance0_;
    let _e98 = (*param_10).reflectance90_;
    let _e100 = (*param_10).reflectance0_;
    let _e103 = (*param_10).VdotH;
    return (_e96 + ((_e98 - _e100) * pow(clamp((1.0 - _e103), 0.0, 1.0), 5.0)));
}

fn CalcGeometricOcculusionstructPBRParamf1f1f1f1f1f1f1vf3vf3f1vf3vf31_(param_11: ptr<function, PBRParam>) -> f32 {
    var NdotL: f32;
    var NdotV: f32;
    var r: f32;
    var attenuationL: f32;
    var attenuationV: f32;

    let _e101 = (*param_11).NdotL;
    NdotL = _e101;
    let _e103 = (*param_11).NdotV;
    NdotV = _e103;
    let _e105 = (*param_11).alphaRoughness;
    r = _e105;
    let _e106 = NdotL;
    let _e108 = NdotL;
    let _e109 = r;
    let _e110 = r;
    let _e112 = r;
    let _e113 = r;
    let _e116 = NdotL;
    let _e117 = NdotL;
    attenuationL = ((2.0 * _e106) / (_e108 + sqrt(((_e109 * _e110) + ((1.0 - (_e112 * _e113)) * (_e116 * _e117))))));
    let _e124 = NdotV;
    let _e126 = NdotV;
    let _e127 = r;
    let _e128 = r;
    let _e130 = r;
    let _e131 = r;
    let _e134 = NdotV;
    let _e135 = NdotV;
    attenuationV = ((2.0 * _e124) / (_e126 + sqrt(((_e127 * _e128) + ((1.0 - (_e130 * _e131)) * (_e134 * _e135))))));
    let _e142 = attenuationL;
    let _e143 = attenuationV;
    return (_e142 * _e143);
}

fn CalcMicrofacetstructPBRParamf1f1f1f1f1f1f1vf3vf3f1vf3vf31_(param_12: ptr<function, PBRParam>) -> f32 {
    var roughness2_: f32;
    var f: f32;

    let _e98 = (*param_12).alphaRoughness;
    let _e100 = (*param_12).alphaRoughness;
    roughness2_ = (_e98 * _e100);
    let _e103 = (*param_12).NdotH;
    let _e104 = roughness2_;
    let _e107 = (*param_12).NdotH;
    let _e110 = (*param_12).NdotH;
    f = ((((_e103 * _e104) - _e107) * _e110) + 1.0);
    let _e113 = roughness2_;
    let _e114 = f;
    let _e116 = f;
    return (_e113 / ((3.1415927410125732 * _e114) * _e116));
}

fn getNormal() -> vec3<f32> {
    var nomral_1: vec3<f32>;
    var t: vec3<f32>;
    var b: vec3<f32>;
    var n_2: vec3<f32>;
    var tbn: mat3x3<f32>;

    nomral_1 = vec3<f32>(0.0, 0.0, 0.0);
    let _e100 = ubo.useNormalTexture;
    if (_e100 != 0) {
        let _e102 = f_WorldTangent_1;
        t = normalize(_e102);
        let _e104 = f_WorldBioTangent_1;
        b = normalize(_e104);
        let _e106 = f_WorldNormal_1;
        n_2 = normalize(_e106);
        let _e108 = t;
        let _e109 = b;
        let _e110 = n_2;
        tbn = mat3x3<f32>(vec3<f32>(_e108.x, _e108.y, _e108.z), vec3<f32>(_e109.x, _e109.y, _e109.z), vec3<f32>(_e110.x, _e110.y, _e110.z));
        let _e124 = f_Texcoord_1;
        let _e125 = textureSample(normalTexture, normalTextureSampler, _e124);
        nomral_1 = _e125.xyz;
        let _e127 = tbn;
        let _e128 = nomral_1;
        let _e133 = ubo.normalMapScale;
        let _e135 = ubo.normalMapScale;
        nomral_1 = normalize((_e127 * (((_e128 * 2.0) - vec3<f32>(1.0)) * vec3<f32>(_e133, _e135, 1.0))));
    } else {
        let _e140 = f_WorldNormal_1;
        nomral_1 = _e140;
    }
    let _e141 = nomral_1;
    return _e141;
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
    var n_3: vec3<f32>;
    var v_2: vec3<f32>;
    var l: vec3<f32>;
    var h: vec3<f32>;
    var reflection: vec3<f32>;
    var NdotL_1: f32;
    var NdotV_1: f32;
    var NdotH: f32;
    var LdotH: f32;
    var VdotH: f32;
    var pbrParam_2: PBRParam;
    var specular_1: vec3<f32>;
    var diffuse_1: vec3<f32>;
    var D: f32;
    var param_13: PBRParam;
    var G: f32;
    var param_14: PBRParam;
    var F: vec3<f32>;
    var param_15: PBRParam;
    var param_16: PBRParam;
    var param_17: PBRParam;
    var param_18: vec3<f32>;
    var param_19: vec3<f32>;
    var param_20: PBRParam;
    var param_21: vec3<f32>;
    var param_22: vec3<f32>;
    var gi_diffuse: vec3<f32>;
    var ao: f32;
    var emissive: vec3<f32>;
    var param_23: vec4<f32>;
    var lsp_1: vec3<f32>;
    var shadowCol: f32;
    var param_24: vec3<f32>;
    var param_25: vec3<f32>;
    var param_26: vec3<f32>;

    col = vec4<f32>(1.0, 1.0, 1.0, 1.0);
    let _e143 = ubo.roughnessFactor;
    perceptualRoughness = _e143;
    let _e145 = ubo.metallicFactor;
    metallic = _e145;
    let _e147 = ubo.useMetallicRoughnessTexture;
    if (_e147 != 0) {
        let _e149 = f_Texcoord_1;
        let _e150 = textureSample(metallicRoughnessTexture, metallicRoughnessTextureSampler, _e149);
        metallicRoughnessColor = _e150;
        let _e151 = perceptualRoughness;
        let _e153 = metallicRoughnessColor[1u];
        perceptualRoughness = (_e151 * _e153);
        let _e155 = metallic;
        let _e157 = metallicRoughnessColor[2u];
        metallic = (_e155 * _e157);
    }
    let _e159 = perceptualRoughness;
    perceptualRoughness = clamp(_e159, 0.03999999910593033, 1.0);
    let _e161 = metallic;
    metallic = clamp(_e161, 0.0, 1.0);
    let _e163 = perceptualRoughness;
    let _e164 = perceptualRoughness;
    alphaRoughness = (_e163 * _e164);
    let _e167 = ubo.useBaseColorTexture;
    if (_e167 != 0) {
        let _e169 = f_Texcoord_1;
        let _e170 = textureSample(baseColorTexture, baseColorTextureSampler, _e169);
        baseColor = _e170;
    } else {
        let _e172 = ubo.baseColorFactor;
        baseColor = _e172;
    }
    f0_ = vec3<f32>(0.03999999910593033, 0.03999999910593033, 0.03999999910593033);
    let _e173 = baseColor;
    let _e175 = f0_;
    diffuseColor = (_e173.xyz * (vec3<f32>(1.0, 1.0, 1.0) - _e175));
    let _e178 = metallic;
    let _e180 = diffuseColor;
    diffuseColor = (_e180 * (1.0 - _e178));
    let _e182 = f0_;
    let _e183 = baseColor;
    let _e185 = metallic;
    specularColor = mix(_e182, _e183.xyz, vec3<f32>(_e185));
    let _e189 = specularColor[0u];
    let _e191 = specularColor[1u];
    let _e194 = specularColor[2u];
    reflectance = max(max(_e189, _e191), _e194);
    let _e196 = reflectance;
    reflectance90_ = clamp((_e196 * 25.0), 0.0, 1.0);
    let _e199 = specularColor;
    specularEnvironmentR0_ = _e199;
    let _e200 = reflectance90_;
    specularEnvironmentR90_ = (vec3<f32>(1.0, 1.0, 1.0) * _e200);
    let _e202 = getNormal();
    n_3 = _e202;
    let _e203 = f_WorldPos_1;
    let _e206 = ubo.cameraPos;
    v_2 = (normalize((_e203.xyz - _e206.xyz)) * -1.0);
    let _e212 = ubo.lightDir;
    l = (normalize(_e212.xyz) * -1.0);
    let _e216 = v_2;
    let _e217 = l;
    h = normalize((_e216 + _e217));
    let _e220 = v_2;
    let _e221 = n_3;
    reflection = normalize(reflect(_e220, _e221));
    let _e224 = n_3;
    let _e225 = l;
    NdotL_1 = clamp(dot(_e224, _e225), 0.0, 1.0);
    let _e228 = n_3;
    let _e229 = v_2;
    NdotV_1 = clamp(abs(dot(_e228, _e229)), 0.0, 1.0);
    let _e233 = n_3;
    let _e234 = h;
    NdotH = clamp(dot(_e233, _e234), 0.0, 1.0);
    let _e237 = l;
    let _e238 = h;
    LdotH = clamp(dot(_e237, _e238), 0.0, 1.0);
    let _e241 = v_2;
    let _e242 = h;
    VdotH = clamp(dot(_e241, _e242), 0.0, 1.0);
    let _e245 = NdotL_1;
    let _e246 = NdotV_1;
    let _e247 = NdotH;
    let _e248 = LdotH;
    let _e249 = VdotH;
    let _e250 = perceptualRoughness;
    let _e251 = metallic;
    let _e252 = specularEnvironmentR0_;
    let _e253 = specularEnvironmentR90_;
    let _e254 = alphaRoughness;
    let _e255 = diffuseColor;
    let _e256 = specularColor;
    pbrParam_2 = PBRParam(_e245, _e246, _e247, _e248, _e249, _e250, _e251, _e252, _e253, _e254, _e255, _e256);
    specular_1 = vec3<f32>(0.0, 0.0, 0.0);
    diffuse_1 = vec3<f32>(0.0, 0.0, 0.0);
    let _e258 = pbrParam_2;
    param_13 = _e258;
    let _e259 = CalcMicrofacetstructPBRParamf1f1f1f1f1f1f1vf3vf3f1vf3vf31_((&param_13));
    D = _e259;
    let _e260 = pbrParam_2;
    param_14 = _e260;
    let _e261 = CalcGeometricOcculusionstructPBRParamf1f1f1f1f1f1f1vf3vf3f1vf3vf31_((&param_14));
    G = _e261;
    let _e262 = pbrParam_2;
    param_15 = _e262;
    let _e263 = CalcFrenelReflectionstructPBRParamf1f1f1f1f1f1f1vf3vf3f1vf3vf31_((&param_15));
    F = _e263;
    let _e264 = NdotL_1;
    let _e266 = NdotV_1;
    if ((_e264 > 0.0) || (_e266 > 0.0)) {
        let _e269 = D;
        let _e270 = G;
        let _e272 = F;
        let _e274 = NdotL_1;
        let _e276 = NdotV_1;
        let _e280 = specular_1;
        specular_1 = (_e280 + ((_e272 * (_e269 * _e270)) / vec3<f32>(((4.0 * _e274) * _e276))));
        let _e282 = specular_1;
        specular_1 = max(_e282, vec3<f32>(0.0, 0.0, 0.0));
        let _e284 = F;
        let _e287 = pbrParam_2;
        param_16 = _e287;
        let _e288 = CalcDiffuseBRDFstructPBRParamf1f1f1f1f1f1f1vf3vf3f1vf3vf31_((&param_16));
        let _e290 = diffuse_1;
        diffuse_1 = (_e290 + ((vec3<f32>(1.0) - _e284) * _e288));
        let _e292 = NdotL_1;
        let _e293 = specular_1;
        let _e294 = diffuse_1;
        let _e296 = ((_e293 + _e294) * _e292);
        col[0u] = _e296.x;
        col[1u] = _e296.y;
        col[2u] = _e296.z;
    }
    let _e304 = ubo.useIBL;
    if (_e304 != 0) {
        let _e306 = pbrParam_2;
        param_17 = _e306;
        let _e307 = v_2;
        param_18 = _e307;
        let _e308 = n_3;
        param_19 = _e308;
        let _e309 = ComputeIBLstructPBRParamf1f1f1f1f1f1f1vf3vf3f1vf3vf31vf3vf3_((&param_17), (&param_18), (&param_19));
        let _e310 = col;
        let _e312 = (_e310.xyz + _e309);
        col[0u] = _e312.x;
        col[1u] = _e312.y;
        col[2u] = _e312.z;
    } else {
        let _e319 = pbrParam_2;
        param_20 = _e319;
        let _e320 = v_2;
        param_21 = _e320;
        let _e321 = n_3;
        param_22 = _e321;
        let _e322 = ComputeReflectionColorstructPBRParamf1f1f1f1f1f1f1vf3vf3f1vf3vf31vf3vf3_((&param_20), (&param_21), (&param_22));
        let _e323 = F;
        let _e325 = col;
        let _e327 = (_e325.xyz + (_e322 * _e323));
        col[0u] = _e327.x;
        col[1u] = _e327.y;
        col[2u] = _e327.z;
        let _e334 = specular_1;
        gi_diffuse = clamp(_e334, vec3<f32>(0.03999999910593033), vec3<f32>(1.0));
        let _e338 = gi_diffuse;
        let _e339 = diffuse_1;
        let _e341 = col;
        let _e343 = (_e341.xyz + (_e338 * _e339));
        col[0u] = _e343.x;
        col[1u] = _e343.y;
        col[2u] = _e343.z;
    }
    let _e351 = ubo.useOcclusionTexture;
    if (_e351 != 0) {
        let _e353 = f_Texcoord_1;
        let _e354 = textureSample(occlusionTexture, occlusionTextureSampler, _e353);
        ao = _e354.x;
        let _e356 = col;
        let _e358 = col;
        let _e360 = ao;
        let _e363 = ubo.occlusionStrength;
        let _e365 = mix(_e356.xyz, (_e358.xyz * _e360), vec3<f32>(_e363));
        col[0u] = _e365.x;
        col[1u] = _e365.y;
        col[2u] = _e365.z;
    }
    let _e373 = ubo.useEmissiveTexture;
    if (_e373 != 0) {
        let _e375 = f_Texcoord_1;
        let _e376 = textureSample(emissiveTexture, emissiveTextureSampler, _e375);
        param_23 = _e376;
        let _e377 = SRGBtoLINEARvf4_((&param_23));
        let _e380 = ubo.emissiveFactor;
        emissive = (_e377.xyz * _e380.xyz);
        let _e383 = emissive;
        let _e384 = col;
        let _e386 = (_e384.xyz + _e383);
        col[0u] = _e386.x;
        col[1u] = _e386.y;
        col[2u] = _e386.z;
    }
    let _e394 = ubo.useShadowMap;
    if (_e394 != 0) {
        let _e396 = f_LightSpacePos_1;
        let _e399 = f_LightSpacePos_1[3u];
        lsp_1 = (_e396.xyz / vec3<f32>(_e399));
        let _e402 = lsp_1;
        lsp_1 = ((_e402 * 0.5) + vec3<f32>(0.5));
        shadowCol = 1.0;
        let _e406 = lsp_1;
        param_24 = _e406;
        let _e407 = n_3;
        param_25 = _e407;
        let _e408 = l;
        param_26 = _e408;
        let _e409 = CalcShadowvf3vf3vf3_((&param_24), (&param_25), (&param_26));
        shadowCol = _e409;
        let _e410 = shadowCol;
        let _e411 = col;
        let _e413 = (_e411.xyz * _e410);
        col[0u] = _e413.x;
        col[1u] = _e413.y;
        col[2u] = _e413.z;
    }
    let _e420 = col;
    let _e422 = pow(_e420.xyz, vec3<f32>(0.4545454680919647, 0.4545454680919647, 0.4545454680919647));
    col[0u] = _e422.x;
    col[1u] = _e422.y;
    col[2u] = _e422.z;
    let _e430 = baseColor[3u];
    col[3u] = _e430;
    let _e432 = col;
    outColor = _e432;
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
