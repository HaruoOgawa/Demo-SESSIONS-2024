#version 450

layout(location = 0) in vec3 fWolrdNormal;
layout(location = 1) in vec2 fUV;
layout(location = 2) in vec3 fViewDir;
layout(location = 3) in vec3 fWorldPos;

// layout(location = 0) out vec4 outCol;
layout(location = 0) out vec4 gPosition;
layout(location = 1) out vec4 gNormal;
layout(location = 2) out vec4 gAlbedo;
layout(location = 3) out vec4 gDepth;
layout(location = 4) out vec4 gParam_1;

layout(binding = 1) uniform FragUniformBufferObject{
	mat4 invModel;
	mat4 model;
    mat4 view;
    mat4 proj;

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

float CalcDepth(vec3 p)
{
	vec4 fragPos = f_ubo.proj * f_ubo.view * vec4(p, 1.0);

    float depth = fragPos.z / fragPos.w;
    depth = depth * 0.5 + 0.5;

    float moment1 = depth;
    float moment2 = depth * depth;

    float dx = dFdx(depth);
    float dy = dFdy(depth);
    moment2 += 0.25 * (dx * dx + dy * dy);

	return moment2;
}

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

        float outDepth = CalcDepth(fWorldPos);

        gPosition = vec4(fWorldPos, 1.0);
		gNormal = vec4(fWolrdNormal, 1.0);
		gAlbedo = vec4(vec3(1.0), 1.0);
		gDepth = vec4(vec3(outDepth), 1.0);
		gParam_1 = vec4(4.0, 0.0, 0.0, 0.0);

        gl_FragDepth = outDepth;
    }
    else
    {
        discard;
    }

    // outCol = col;
}