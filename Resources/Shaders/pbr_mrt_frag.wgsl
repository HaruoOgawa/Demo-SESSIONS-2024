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

struct FragmentOutput {
    @location(0) member: vec4<f32>,
    @location(1) member_1: vec4<f32>,
    @location(2) member_2: vec4<f32>,
    @location(3) member_3: vec4<f32>,
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
@group(0) @binding(4) 
var metallicRoughnessTexture: texture_2d<f32>;
@group(0) @binding(5) 
var metallicRoughnessTextureSampler: sampler;
@group(0) @binding(2) 
var baseColorTexture: texture_2d<f32>;
@group(0) @binding(3) 
var baseColorTextureSampler: sampler;
var<private> gl_FragCoord_1: vec4<f32>;
var<private> gPosition: vec4<f32>;
var<private> f_WorldPos_1: vec4<f32>;
var<private> gNormal: vec4<f32>;
var<private> gAlbedo: vec4<f32>;
var<private> gDepth: vec4<f32>;
var<private> f_LightSpacePos_1: vec4<f32>;
@group(0) @binding(6) 
var emissiveTexture: texture_2d<f32>;
@group(0) @binding(7) 
var emissiveTextureSampler: sampler;
@group(0) @binding(10) 
var occlusionTexture: texture_2d<f32>;
@group(0) @binding(11) 
var occlusionTextureSampler: sampler;
@group(0) @binding(12) 
var cubemapTexture: texture_cube<f32>;
@group(0) @binding(13) 
var cubemapTextureSampler: sampler;
@group(0) @binding(14) 
var shadowmapTexture: texture_2d<f32>;
@group(0) @binding(15) 
var shadowmapTextureSampler: sampler;
@group(0) @binding(16) 
var IBL_Diffuse_Texture: texture_2d<f32>;
@group(0) @binding(17) 
var IBL_Diffuse_TextureSampler: sampler;
@group(0) @binding(18) 
var IBL_Specular_Texture: texture_2d<f32>;
@group(0) @binding(19) 
var IBL_Specular_TextureSampler: sampler;
@group(0) @binding(20) 
var IBL_GGXLUT_Texture: texture_2d<f32>;
@group(0) @binding(21) 
var IBL_GGXLUT_TextureSampler: sampler;
@group(0) @binding(22) 
var cubeMap2DTexture: texture_2d<f32>;
@group(0) @binding(23) 
var cubeMap2DTextureSampler: sampler;

fn getNormal() -> vec3<f32> {
    var nomral: vec3<f32>;
    var t: vec3<f32>;
    var b: vec3<f32>;
    var n: vec3<f32>;
    var tbn: mat3x3<f32>;

    nomral = vec3<f32>(0.0, 0.0, 0.0);
    let _e61 = ubo.useNormalTexture;
    if (_e61 != 0) {
        let _e63 = f_WorldTangent_1;
        t = normalize(_e63);
        let _e65 = f_WorldBioTangent_1;
        b = normalize(_e65);
        let _e67 = f_WorldNormal_1;
        n = normalize(_e67);
        let _e69 = t;
        let _e70 = b;
        let _e71 = n;
        tbn = mat3x3<f32>(vec3<f32>(_e69.x, _e69.y, _e69.z), vec3<f32>(_e70.x, _e70.y, _e70.z), vec3<f32>(_e71.x, _e71.y, _e71.z));
        let _e85 = f_Texcoord_1;
        let _e86 = textureSample(normalTexture, normalTextureSampler, _e85);
        nomral = _e86.xyz;
        let _e88 = tbn;
        let _e89 = nomral;
        let _e94 = ubo.normalMapScale;
        let _e96 = ubo.normalMapScale;
        nomral = normalize((_e88 * (((_e89 * 2.0) - vec3<f32>(1.0)) * vec3<f32>(_e94, _e96, 1.0))));
    } else {
        let _e101 = f_WorldNormal_1;
        nomral = _e101;
    }
    let _e102 = nomral;
    return _e102;
}

fn main_1() {
    var col: vec4<f32>;
    var perceptualRoughness: f32;
    var metallic: f32;
    var metallicRoughnessColor: vec4<f32>;
    var baseColor: vec4<f32>;
    var n_1: vec3<f32>;
    var depth: f32;

    col = vec4<f32>(1.0, 1.0, 1.0, 1.0);
    let _e63 = ubo.roughnessFactor;
    perceptualRoughness = _e63;
    let _e65 = ubo.metallicFactor;
    metallic = _e65;
    let _e67 = ubo.useMetallicRoughnessTexture;
    if (_e67 != 0) {
        let _e69 = f_Texcoord_1;
        let _e70 = textureSample(metallicRoughnessTexture, metallicRoughnessTextureSampler, _e69);
        metallicRoughnessColor = _e70;
        let _e71 = perceptualRoughness;
        let _e73 = metallicRoughnessColor[1u];
        perceptualRoughness = (_e71 * _e73);
        let _e75 = metallic;
        let _e77 = metallicRoughnessColor[2u];
        metallic = (_e75 * _e77);
    }
    let _e79 = perceptualRoughness;
    perceptualRoughness = clamp(_e79, 0.03999999910593033, 1.0);
    let _e81 = metallic;
    metallic = clamp(_e81, 0.0, 1.0);
    let _e84 = ubo.useBaseColorTexture;
    if (_e84 != 0) {
        let _e86 = f_Texcoord_1;
        let _e87 = textureSample(baseColorTexture, baseColorTextureSampler, _e86);
        baseColor = _e87;
    } else {
        let _e89 = ubo.baseColorFactor;
        baseColor = _e89;
    }
    let _e90 = getNormal();
    n_1 = _e90;
    let _e92 = gl_FragCoord_1[2u];
    depth = _e92;
    let _e93 = f_WorldPos_1;
    gPosition = _e93;
    let _e94 = n_1;
    gNormal = vec4<f32>(_e94.x, _e94.y, _e94.z, 1.0);
    let _e99 = baseColor;
    gAlbedo = _e99;
    let _e100 = depth;
    gDepth = vec4<f32>(_e100);
    return;
}

@fragment 
fn main(@location(3) f_WorldTangent: vec3<f32>, @location(4) f_WorldBioTangent: vec3<f32>, @location(0) f_WorldNormal: vec3<f32>, @location(1) f_Texcoord: vec2<f32>, @builtin(position) gl_FragCoord: vec4<f32>, @location(2) f_WorldPos: vec4<f32>, @location(5) f_LightSpacePos: vec4<f32>) -> FragmentOutput {
    f_WorldTangent_1 = f_WorldTangent;
    f_WorldBioTangent_1 = f_WorldBioTangent;
    f_WorldNormal_1 = f_WorldNormal;
    f_Texcoord_1 = f_Texcoord;
    gl_FragCoord_1 = gl_FragCoord;
    f_WorldPos_1 = f_WorldPos;
    f_LightSpacePos_1 = f_LightSpacePos;
    main_1();
    let _e18 = gPosition;
    let _e19 = gNormal;
    let _e20 = gAlbedo;
    let _e21 = gDepth;
    return FragmentOutput(_e18, _e19, _e20, _e21);
}
