#version 450

layout(location = 0) in vec3 fWolrdNormal;
layout(location = 1) in vec2 fUV;
layout(location = 2) in vec3 fViewDir;

layout(location = 0) out vec4 outCol;

layout(binding = 1) uniform FragUniformBufferObject{
	mat4 pad0;
	mat4 pad1;
	mat4 pad2;
	mat4 pad3;

	float maxWidth;
	float charWidth;
    float numOfChar;
    float textID;
} f_ubo;

#ifdef USE_OPENGL
layout(binding = 2) uniform sampler2D MainTexture;
#else
layout(binding = 2) uniform texture2D MainTexture;
layout(binding = 3) uniform sampler MainTextureSampler;
#endif

void main()
{
    vec4 col = vec4(0.0f, 0.0, 0.0,1.0);

    vec2 st = fUV;

    // UV上での1文字あたりのサイズ
    float uvCharW = (1.0 / f_ubo.maxWidth) * f_ubo.charWidth;
    st.x *= uvCharW;

    // textIDでオフセットさせる
    st.x += uvCharW * floor(f_ubo.textID);
    
    #ifdef USE_OPENGL
    float dist = texture(MainTexture, vec2(st.x, 1.0 - st.y)).r;
    #else
    float dist = texture(sampler2D(MainTexture, MainTextureSampler), vec2(st.x, 1.0 - st.y)).r;
    #endif
    
    float t = 0.5;
    float alpha = smoothstep(t - 0.01, t + 0.01, dist);

    if(alpha > 0.5)
    {
        col.rgb = vec3(1.0);
    }
    else
    {
        discard;
    }

    outCol = col;
}