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
    vec4 placeCubeSize;
    vec4 v4Pad2;

	vec2 resolution;
	float time;
	float deltaTime;
	float zLength;

	float LightParam;
	float useZAnim;
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

float sdTorus(vec3 p, vec2 t)
{
	vec2 q = vec2(length(p.xz) - t.x, p.y);
	return length(q) - t.y;
}

vec2 pmod(vec2 p, float seg)
{
	float n = pi2 / seg;
	float a = atan(p.x, p.y) + n * 0.5;
	a = floor(a / n) * n;
	return p * rot(-a);
}

MatInfo Brossum(vec3 p, vec3 offset, float gridW)
{
	MatInfo Info;
	Info.d = 1e5;
	Info.MatID = -1;
	Info.metallic = 0.0;
	Info.roughness = 0.0;

	p += offset;

	float Dist = 1e5;

	float BaseH = 2.0;
	p.y += BaseH;

	if(length(p.xz - fragUbo.cameraPos.xz) > 25.0) return Info;
	
	if(floor(fragUbo.useZAnim) == 1.0) p.z += fragUbo.time;

	vec2 gridID = floor(p.xz / gridW) * gridW;
	p.xz = repeat(p.xz, gridW);

	float Loop = 3.0;
	for(float i = 0.0; i < Loop; i++)
	{
		vec3 pos = p;
		// pos.x *= 2.0;

		pos.xz *= rot(pi * (1.0 / Loop) * i);
		pos.yz *= rot(pi * 0.5);

		// この時点でのPosをアニメーション用に保持しておく
		vec3 animP = pos;

		pos.x = abs(pos.x) - 0.25;

		vec3 v = vec3(0.0, 0.0, 0.1);
		pos -= clamp(pos, -v, v);

		// float TorusBold = 0.0025 + 0.0025 * exp(length(0.5 * p.y));
		// float TorusBold = 0.0025 * exp(length(1.0 * p.y));
		float TorusBold = 0.00025 + 0.02 * length(1.0 * p.y);

		float d = sdTorus(pos , vec2(0.25, TorusBold) );
		Dist = min(Dist, d);

		{
			float tempo = 500.0;
			float Local = mod(fragUbo.time + rand(vec2(gridID.x * 10.0, 0.12354)) * 100.0 + rand(vec2(0.9746, gridID.y * 10.0)) * 100.0, tempo);
			float trans = tempo - 2.0 * 3.1415;
			float t = step(Local, trans) * (Local - trans);
			float w = sin(t) * 0.5 + 0.5;
			float CutCube = sdBox(animP, vec3(0.75 * w, 0.75 * w, 0.75 * w));
			Dist = max(Dist, CutCube);
		}

		// 下半分を削る
		{
			float CutCube = sdBox(p - vec3(0.0, 0.25, 0.0), vec3(0.75, 0.25, 0.75));
			Dist = max(Dist, CutCube);
		}

		Info = getMin(Info, Dist, 4.0, 0.25, 1.0);
	}

	return Info;
}

MatInfo map(vec3 p)
{
	MatInfo Info;
	Info.d = 1e5;
	Info.MatID = -1;
	Info.metallic = 0.0;
	Info.roughness = 0.0;

	float offset = 2.0;
	float gridW = 4.0;

	{
		MatInfo B = Brossum(p, vec3(0.0), gridW);
		Info = getMin(Info, B.d, B.MatID, B.metallic, B.roughness);
	}

	{
		MatInfo B = Brossum(p, vec3(offset, 0.0, offset), gridW);
		Info = getMin(Info, B.d, B.MatID, B.metallic, B.roughness);
	}

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
		depth += Info.d;
		p = ro + rd * depth;

		if(abs(Info.d) < MIN_VALUE) break;
	}

	if(Info.d < MIN_VALUE)
	{
		vec3 n = gn(p);
		float outDepth = CalcDepth(p);

		col = vec3(1.0);

		// Emission
		if(Info.MatID == 4.0)
		{
			col = fragUbo.mainColor.rgb * 2.0;
		}

		gPosition = vec4(p, 1.0);
		gNormal = vec4(n, 1.0);
		gAlbedo = vec4(col, 1.0);
		gDepth = vec4(vec3(outDepth), 1.0);
		gParam_1 = vec4(Info.MatID, fragUbo.LightParam, Info.metallic, Info.roughness);

		gl_FragDepth = outDepth;
	}
	else
	{
		discard;
	}
}