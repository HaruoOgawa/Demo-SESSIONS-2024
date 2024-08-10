struct UniformBufferObject {
  /* @offset(0) */
  UseBlur : i32,
  /* @offset(4) */
  KernelSize : i32,
  /* @offset(8) */
  Direction : vec2<f32>,
}

@group(0) @binding(0) var<uniform> ubo : UniformBufferObject;

@group(0) @binding(2) var SrcTex : texture_2d<f32>;

@group(0) @binding(3) var SamplerSrcTex : sampler;

var<private> f_UV : vec2<f32>;

var<private> outColor : vec4<f32>;

fn CalcGaussianKernel_() -> array<f32, 21u> {
  var Sum : f32;
  var sigma : f32;
  var pi : f32;
  var support : f32;
  var radius : f32;
  var i : i32;
  var x : f32;
  var v : f32;
  var Kernal : array<f32, 21u>;
  var p : i32;
  var v_1 : f32;
  Sum = 0.0f;
  sigma = 3.0f;
  pi = 3.14149999618530273438f;
  support = 0.99500000476837158203f;
  let x_24 : f32 = sigma;
  let x_26 : f32 = sigma;
  let x_29 : f32 = support;
  radius = ceil(sqrt((((-2.0f * x_24) * x_26) * log((1.0f - x_29)))));
  i = 0i;
  let x_40 : f32 = radius;
  x = -(x_40);
  loop {
    let x_47 : f32 = x;
    let x_48 : f32 = radius;
    if ((x_47 <= x_48)) {
    } else {
      break;
    }
    let x_52 : f32 = x;
    let x_53 : f32 = x;
    let x_57 : f32 = sigma;
    let x_59 : f32 = sigma;
    let x_63 : f32 = sigma;
    let x_64 : f32 = pi;
    v = (exp((-((x_52 * x_53)) / ((2.0f * x_57) * x_59))) / (x_63 * sqrt((2.0f * x_64))));
    let x_69 : f32 = v;
    let x_70 : f32 = Sum;
    Sum = (x_70 + x_69);
    let x_74 : i32 = i;
    let x_75 : f32 = v;
    Kernal[x_74] = x_75;
    let x_77 : i32 = i;
    i = (x_77 + 1i);

    continuing {
      let x_80 : f32 = x;
      x = (x_80 + 1.0f);
    }
  }
  p = 0i;
  loop {
    let x_88 : i32 = p;
    if ((x_88 < 21i)) {
    } else {
      break;
    }
    let x_92 : i32 = p;
    let x_94 : f32 = Kernal[x_92];
    v_1 = x_94;
    let x_95 : i32 = p;
    let x_96 : f32 = v_1;
    let x_97 : f32 = Sum;
    Kernal[x_95] = (x_96 / x_97);

    continuing {
      let x_100 : i32 = p;
      p = (x_100 + 1i);
    }
  }
  let x_102 : array<f32, 21u> = Kernal;
  return x_102;
}

fn main_1() {
  var col : vec3<f32>;
  var dir : vec2<f32>;
  var halfSize : i32;
  var Kernal_1 : array<f32, 21u>;
  var i_1 : i32;
  col = vec3<f32>(0.0f, 0.0f, 0.0f);
  let x_118 : vec2<f32> = ubo.Direction;
  dir = x_118;
  let x_122 : i32 = ubo.KernelSize;
  halfSize = ((x_122 - 1i) / 2i);
  let x_126 : array<f32, 21u> = CalcGaussianKernel_();
  Kernal_1 = x_126;
  let x_128 : i32 = ubo.UseBlur;
  if ((x_128 != 0i)) {
    i_1 = 0i;
    loop {
      let x_138 : i32 = i_1;
      let x_140 : i32 = ubo.KernelSize;
      if ((x_138 < x_140)) {
      } else {
        break;
      }
      let x_154 : vec2<f32> = f_UV;
      let x_155 : vec2<f32> = dir;
      let x_156 : i32 = i_1;
      let x_157 : i32 = halfSize;
      let x_163 : vec4<f32> = textureSample(SrcTex, SamplerSrcTex, (x_154 + (x_155 * f32((x_156 - x_157)))));
      let x_165 : i32 = i_1;
      let x_167 : f32 = Kernal_1[x_165];
      let x_169 : vec3<f32> = col;
      col = (x_169 + (vec3<f32>(x_163.x, x_163.y, x_163.z) * x_167));

      continuing {
        let x_171 : i32 = i_1;
        i_1 = (x_171 + 1i);
      }
    }
  } else {
    let x_177 : vec2<f32> = f_UV;
    let x_178 : vec4<f32> = textureSample(SrcTex, SamplerSrcTex, x_177);
    col = vec3<f32>(x_178.x, x_178.y, x_178.z);
  }
  let x_182 : vec3<f32> = col;
  outColor = vec4<f32>(x_182.x, x_182.y, x_182.z, 1.0f);
  return;
}

struct main_out {
  @location(0)
  outColor_1 : vec4<f32>,
}

@fragment
fn main(@location(0) f_UV_param : vec2<f32>) -> main_out {
  f_UV = f_UV_param;
  main_1();
  return main_out(outColor);
}
