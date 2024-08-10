struct TestData {
    offset: vec4<f32>,
    color: vec4<f32>,
    AccumulateDeltaTime: f32,
    pad0_: f32,
    pad1_: f32,
    pad2_: f32,
}

struct WriteOnlyTestBufferObject {
    data: array<TestData>,
}

struct ParamUBO {
    time: f32,
    deltaTime: f32,
    pad0_: f32,
    pad1_: f32,
}

struct ReadOnlyTestBufferObject {
    data: array<TestData>,
}

var<private> gl_GlobalInvocationID_1: vec3<u32>;
@group(0) @binding(2) 
var<storage, read_write> w_TBO: WriteOnlyTestBufferObject;
@group(0) @binding(0) 
var<uniform> ubo: ParamUBO;
@group(0) @binding(1) 
var<storage> r_TBO: ReadOnlyTestBufferObject;

fn randvf2_(st: ptr<function, vec2<f32>>) -> f32 {
    let _e25 = (*st);
    return fract((sin(dot(_e25, vec2<f32>(12.989800453186035, 78.23300170898438))) * 43758.546875));
}

fn main_1() {
    var id: u32;
    var id_f: f32;
    var param: vec2<f32>;

    let _e28 = gl_GlobalInvocationID_1[0u];
    id = _e28;
    let _e29 = id;
    id_f = f32(_e29);
    let _e31 = id;
    let _e33 = ubo.deltaTime;
    let _e37 = w_TBO.data[_e31].AccumulateDeltaTime;
    w_TBO.data[_e31].AccumulateDeltaTime = (_e37 + _e33);
    let _e42 = id;
    let _e46 = w_TBO.data[_e42].AccumulateDeltaTime;
    if (_e46 >= 0.008333333767950535) {
        let _e48 = id;
        w_TBO.data[_e48].AccumulateDeltaTime = 0.0;
        let _e52 = id;
        let _e54 = ubo.time;
        let _e55 = id_f;
        let _e56 = id_f;
        param = vec2<f32>(_e55, (_e56 + 12.394000053405762));
        let _e59 = randvf2_((&param));
        let _e68 = w_TBO.data[_e52].offset[1u];
        w_TBO.data[_e52].offset[1u] = (_e68 + (sin((_e54 + (_e59 * 10.0))) * 0.10000000149011612));
    }
    return;
}

@compute @workgroup_size(256, 1, 1) 
fn main(@builtin(global_invocation_id) gl_GlobalInvocationID: vec3<u32>) {
    gl_GlobalInvocationID_1 = gl_GlobalInvocationID;
    main_1();
}
