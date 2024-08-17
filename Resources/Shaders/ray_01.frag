#version 450

layout(location = 0) in vec4 v2f_ObjectPos;
layout(location = 1) in vec2 v2f_UV;

layout(location = 0) out vec4 outColor;

layout(binding = 1) uniform FragUniformBufferObject{
	mat4 invModel;
	mat4 model;
    mat4 view;
    mat4 proj;

	vec4 cameraPos;
    vec4 mainColor;
    vec4 v4Pad1;
    vec4 v4Pad2;

	vec2 resolution;
	float time;
	float deltaTime;
	float zLength;
	float fpad0;
} fragUbo;

#define repeat(p, a) mod(p, a) - a * 0.5

// float sdBox(vec3 p, vec3 s)
// {}

float map(vec3 p)
{
	p.z += fragUbo.time;
	p = repeat(p, 2.5);

	return length(p) - 0.5f;
}

vec3 gn(vec3 p)
{
	vec2 e = vec2(0.001, 0.0);
	return normalize(vec3(
		map(p + e.xyy) - map(p - e.xyy),
		map(p + e.yxy) - map(p - e.yxy),
		map(p + e.yyx) - map(p - e.yyx)
	));
}

float CalcDepth(vec3 p)
{
	vec4 fragPos = fragUbo.proj * fragUbo.view * vec4(p, 1.0);

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
	vec3 col = vec3(0.0, 0.0, 0.0);
	
	vec2 st = v2f_UV * 2.0 - 1.0;
	st.x *= (fragUbo.resolution.x / fragUbo.resolution.y);

	// vec3 ro = vec3(0.0, 0.0, -5.0);
	// vec3 rd = normalize(vec3(st, fragUbo.zLength));
	
	vec3 ro = (fragUbo.invModel * fragUbo.cameraPos).xyz;
    vec3 rd = normalize(v2f_ObjectPos.xyz - ro);

	// カメラのオフセット分を追加する。これがないと原点として扱われる
	ro += fragUbo.cameraPos.xyz;

	float dist = 0.0, depth = 0.0;
	for(int i = 0; i < 64; i++)
	{
		dist = map(ro + rd * depth);
		depth += dist;

		if(dist < 0.001) break;
	}

	if(dist < 0.001)
	{
		vec3 p = ro + rd * depth;
		vec3 n = gn(p);

		col = vec3(n * 0.5 + 0.5);

		gl_FragDepth = CalcDepth(p);
	}
	else
	{
		gl_FragDepth = 1.0;
	}

	outColor = vec4(col, 1.0);
}