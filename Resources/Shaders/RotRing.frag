#version 450

layout(location = 0) in vec4 v2f_ObjectPos;
layout(location = 1) in vec2 v2f_UV;

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

	vec4 cameraPos;
    vec4 mainColor;
    vec4 param0;
    vec4 param1;

	vec2 resolution;
	float time;
	float deltaTime;
	float zLength;
	float tparam;

	float LightParam;
	float fPad0;
	float fPad1;
	float fPad2;
} fragUbo;

#define repeat(p, a) mod(p, a) - a * 0.5
#define rot(a) mat2(cos(a), sin(a), -sin(a), cos(a))
#define pi acos(-1.0)
#define pi2 pi * 2.0

//
const float MIN_VALUE = 1E-3;

struct MatInfo
{
	float d;
	float MatID;
	float metallic;
	float roughness;
};

MatInfo getMin(MatInfo src, float Dist, float MatID, float m, float r)
{
	MatInfo dst = src;

	if(Dist < dst.d)
	{
		dst.d = Dist;
		dst.MatID = MatID;
		dst.metallic = m;
		dst.roughness = r;
	}

	return dst;
}

//
float rand(vec2 st)
{
	return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453123) * 2.0 - 1.0;
}

float sdBox(vec3 p, vec3 s)
{
	return length(max(vec3(0.0), abs(p) - s));
}

MatInfo map(vec3 p)
{
	MatInfo Info;
	Info.d = 1e5;
	Info.MatID = -1;
	Info.metallic = 0.0;
	Info.roughness = 0.0;

	float time = fragUbo.time * 0.1;

	float d = 1e5;
	float scl = 3.0;
	float w = 0.01;

	p.z += fragUbo.time;

	float gridW = 2.0;
	float gridID = floor(p.z / gridW) * gridW;
	p.z = repeat(p.z, gridW);

	p.xy *= rot(gridID * 1.5);

	for(float i = 0.0; i < 4.0; i++)
	{
		vec3 pos = p;
		pos.xy *= rot(pi * 0.5 * i);
		pos.x += 0.5 * scl;
		
		d = min(d, sdBox(pos, vec3(w, 0.5, w) * scl));
	}

	Info = getMin(Info, d, 4.0, 0.25, 1.0);

	return Info;
}

vec3 gn(vec3 p)
{
	vec2 e = vec2(MIN_VALUE, 0.0);
	return normalize(vec3(
		map(p + e.xyy).d - map(p - e.xyy).d,
		map(p + e.yxy).d - map(p - e.yxy).d,
		map(p + e.yyx).d - map(p - e.yyx).d
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
	
	vec3 ro = (fragUbo.invModel * fragUbo.cameraPos).xyz;
    vec3 rd = normalize(v2f_ObjectPos.xyz - ro);

	// カメラのオフセット分を追加する。これがないと原点として扱われる
	ro += fragUbo.cameraPos.xyz;

	float depth = 0.0, lenToNextGrid = 0.0;
	vec3 p = ro + rd * depth;

	MatInfo Info;
	Info.d = 1e5;
	Info.MatID = -1;
	Info.metallic = 0.0;
	Info.roughness = 0.0;

	for(int i = 0; i < 64; i++)
	{
		Info = map(p);
		depth += Info.d * 0.5;
		p = ro + rd * depth;

		if(abs(Info.d) < MIN_VALUE) break;
	}

	if(Info.d < MIN_VALUE)
	{
		vec3 n = gn(p);
		float outDepth = CalcDepth(p);

		col = fragUbo.mainColor.rgb;

		// Emission
		if(Info.MatID == 4.0)
		{
			col = vec3(2.0, 1.2, 1.0);
		}

		gPosition = vec4(p, 1.0);
		gNormal = vec4(n, 1.0);
		gAlbedo = vec4(col, 1.0);
		gDepth = vec4(vec3(outDepth), 1.0);
		gParam_1 = vec4(Info.MatID, 0.0, Info.metallic, Info.roughness);

		gl_FragDepth = outDepth;
	}
	else
	{
		discard;
	}
}