#version 450

layout(location = 0) in vec2 f_UV;

layout(location = 0) out vec4 outColor;

layout(binding = 0) uniform UniformBufferObject{
    //float Kernal[32];

    int UseBlur;
    int KernelSize;
    vec2 Direction;
} ubo;

// カーネルサイズを可変にしたいときは大きめの値(例えば33とか)を事前に確保しておいて、それよりも小さい時は空いたとことを0詰めして使用する
// そうすれば配列サイズをいちいち弄らなくてもよくなる
// もしかしたら2のn乗しかだめかも？
//layout(binding = 1) uniform GaussianKernelBuffer{
//    float Kernal[32];
//} kbo;

#ifdef USE_OPENGL
layout(binding = 2) uniform sampler2D SrcTex;
#else
layout(binding = 2) uniform texture2D SrcTex;
layout(binding = 3) uniform sampler SamplerSrcTex;
#endif

float[21] CalcGaussianKernel()
{
    float Kernal[21];

    float Sum = 0.0;
	float sigma = 3.0;
	float pi = 3.1415;
	float support = 0.995;

    float radius = ceil(sqrt(-2.0 * sigma * sigma * log(1.0 - support)));
    int i = 0;

    for(float x = -radius; x <= radius; x++)
    {
        float v = exp(-(x * x) / (2.0 * sigma * sigma)) / (sigma * sqrt(2.0 * pi));
		Sum += v;

        Kernal[i] = v;

        i++;
    }

    // 正規化
    for(int p = 0; p < 21; p++)
    {
        float v = Kernal[p];
        Kernal[p] = v / Sum;
    }

    return Kernal;
}

void main() {
    vec3 col = vec3(0.0);
    vec2 dir = ubo.Direction;

    int halfSize = (ubo.KernelSize - 1) / 2;

    float Kernal[21] = CalcGaussianKernel();
    
    if(ubo.UseBlur != 0)
    {
        for(int i = 0; i < ubo.KernelSize; i++)
        {
            #ifdef USE_OPENGL
            col += texture(SrcTex, f_UV + dir * float(i - halfSize)).rgb * Kernal[i];
            #else
            col += texture(sampler2D(SrcTex, SamplerSrcTex), f_UV + dir * float(i - halfSize)).rgb * Kernal[i];
            #endif
        }
    }
    else
    {
        #ifdef USE_OPENGL
        col = texture(SrcTex, f_UV).rgb;
        #else
        col = texture(sampler2D(SrcTex, SamplerSrcTex), f_UV).rgb;
        #endif
    }
    
    outColor = vec4(col, 1.0);
}