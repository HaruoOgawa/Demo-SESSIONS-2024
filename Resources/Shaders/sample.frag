#version 450

layout(location = 0) in vec3 f_WorldNormal;
layout(location = 1) in vec2 f_Texcoord;
layout(location = 2) in vec4 f_WorldPos;
layout(location = 3) in vec4 f_Color;

layout(location = 0) out vec4 outColor;

layout(binding = 0) uniform UniformBufferObject{
	mat4 model;
    mat4 view;
    mat4 proj;
	mat4 lightVPMat;

    vec4 color;

    int useTexture;
    int pad0;
    int pad1;
    int pad2;
} ubo;

#ifdef USE_OPENGL
layout(binding = 1) uniform sampler2D baseColorTexture;
#else
layout(binding = 1) uniform texture2D baseColorTexture;
layout(binding = 2) uniform sampler baseColorTextureSampler;
#endif

void main(){
	vec4 col = f_Color;

    col.rg = f_Texcoord;

    if(ubo.useTexture != 0)
    {
        #ifdef USE_OPENGL
		col.rgb = texture(baseColorTexture, f_Texcoord).rgb;
		#else
		col.rgb = texture(sampler2D(baseColorTexture, baseColorTextureSampler), f_Texcoord).rgb;
		#endif
    }

	outColor = col;
}