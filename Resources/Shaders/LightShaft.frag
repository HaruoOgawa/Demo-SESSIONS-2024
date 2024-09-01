#version 450

layout(location = 0) in vec2 fUV;

#ifdef USE_OPENGL
layout(binding = 0) uniform sampler2D texImage;
layout(binding = 2) uniform sampler2D depthImage;
#else
layout(binding = 0) uniform texture2D texImage;
layout(binding = 1) uniform sampler texSampler;
layout(binding = 2) uniform texture2D depthImage;
layout(binding = 3) uniform sampler depthSampler;
#endif

layout(binding = 4) uniform FragUniformBuffer
{
	mat4 model;
    mat4 view;
    mat4 proj;
	mat4 lightVPMat;

	vec4 lightPos;

	float exposure; // ���̘I�o
	float decay; // ���̌���
	float density; // ���̖��x
	float weight; // �T���v���̏d��

	float numSamples; // �T���v����
	float fPad0;
	float fPad1;
	float fPad2;
} frag_ubo;

layout(location = 0) out vec4 outColor;

vec3 GetMainCol(vec2 texcoord)
{
	vec4 col = vec4(0.0);

	#ifdef USE_OPENGL
	col.rgb = texture(texImage, texcoord).rgb;
	#else
	col.rgb = texture(sampler2D(texImage, texSampler), texcoord).rgb;
	#endif

	return col.rgb;
}

float GetDepth(vec2 texcoord)
{
	float depth = 1.0;

	#ifdef USE_OPENGL
	depth = texture(depthImage, texcoord).r;
	#else
	depth = texture(sampler2D(depthImage, depthSampler), texcoord).r;
	#endif

	return depth;
}

void main()
{
	vec2 st = fUV;
	vec2 texcoord = st;

	// �X�N���[�����W�n�ł̃��C�g�ʒu
	vec4 TmpScreenLightPos = (frag_ubo.proj * frag_ubo.view * vec4(frag_ubo.lightPos.xyz, 1.0));
	vec3 ScreenLightPos = TmpScreenLightPos.xyz / TmpScreenLightPos.w;

	// Pixel To Light Vector
	vec2 deltaTexcoord = texcoord - (ScreenLightPos.xy);

	// �x�N�g���̒������T���v�����ŕ������āA���x(dencity)�̕������X�P�[������
	deltaTexcoord *= (1.0 / frag_ubo.numSamples) * frag_ubo.density;

	// �����J���[��ێ�
	vec3 col = GetMainCol(texcoord);

	// �Ɩ��̌����ʂ�������
	float illuminationDecay = 1.0;

	// ���݂̐[�x
	float currentDepth = GetDepth(st);

	// ���C�}�[�`���O�ɂ��T���v�����O���s��
	for(float i = 0.0; i < frag_ubo.numSamples; i++)
	{
		// deltaTexcoord�̕��������C��i�߂�
		texcoord -= deltaTexcoord;

		vec3 sampler = GetMainCol(texcoord);

		/*// �T���v���ʒu�̐[�x���擾
		float sampleDepth = GetDepth(texcoord);

		// �[�x�Ɋ�Â��Č��̎Օ��𔻒f
		if(sampleDepth < currentDepth)
		{
			// �����Ւf����Ă���ꍇ�A���̋��x������������
			illuminationDecay *= frag_ubo.decay;
		}*/

		// ����������
		sampler *= illuminationDecay * frag_ubo.weight;

		//
		illuminationDecay *= frag_ubo.decay;

		col += sampler;
	}

	// �I�o�𒲐�
	col *= frag_ubo.exposure;

	outColor = vec4(col, 1.0);
}