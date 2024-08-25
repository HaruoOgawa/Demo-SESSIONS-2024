#version 450

layout(location = 0) in vec4 v2f_ObjectPos;
layout(location = 1) in vec2 v2f_UV;

layout(location = 0) out vec4 gPosition;
layout(location = 1) out vec4 gNormal;
layout(location = 2) out vec4 gAlbedo;
layout(location = 3) out vec4 gDepth;
layout(location = 4) out vec4 gParam_1; // (Material_ID, None, None, None)

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
	float fpad0;
} fragUbo;

#define repeat(p, a) mod(p, a) - a * 0.5
#define gmin(dst, src) dst = min(dst, src)
#define rot(a) mat2(cos(a), sin(a), -sin(a), cos(a))
#define pi acos(-1.0)
#define pi2 pi * 2.0

//
const float MIN_VALUE = 1E-3;

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

vec2 pmod(vec2 p, float s)
{
	float n = pi2 / s;
	float a = atan(p.x, p.y) + n * 0.5;
	a = floor(a / n) * n;

	return p * rot(-a);
}

float map(vec3 pos)
{
	float Dst = 1e5;

	// p.xy *= rot(fragUbo.time);
	// p.yz *= rot(fragUbo.time);
	// p.xz *= rot(fragUbo.time);

	{
		vec3 p = pos;

		float scale = 1.0;
		for(int i = 0; i < 10; i++)
		{
			// p = 1.0 - abs(p - 1.0);
			// p = 1.0 - abs(p);
			// p = abs(p) - vec3(0.2, 0.5, 0.2);
			p.xy = pmod(p.xy, 6);
			p = abs(p) - vec3(0.2, 2.0, 0.2);

			// float sc = clamp(max(0.0,  2.0/dot(p, p)), 0.0, 2.0);
			float sc = clamp(max(0.0, 2.0 / dot(p, p)), 0.0, 2.0);
			scale *= sc;
			p *= sc; 

			p.xy *= rot(pi * 0.25);
			// p.xz *= rot(pi * 0.8)
			p -= 0.1;
		}

		float d = length(p) / scale - 0.02;
		// float d = sdTorus(p / scale, vec2(0.5, 0.25));

		// p.xy = pmod(p.xy, 3);
		// float d = sdBox(p, vec3(0.5));
		gmin(Dst, d);
	}

	return Dst;
}

vec3 gn(vec3 p)
{
	vec2 e = vec2(MIN_VALUE, 0.0);
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
	
	vec3 ro = (fragUbo.invModel * fragUbo.cameraPos).xyz;
    vec3 rd = normalize(v2f_ObjectPos.xyz - ro);

	// カメラのオフセット分を追加する。これがないと原点として扱われる
	ro += fragUbo.cameraPos.xyz;

	float dist = 0.0, depth = 0.0, lenToNextGrid = 0.0;
	vec3 p = ro + rd * depth;

	for(int i = 0; i < 64; i++)
	{
		dist = map(p);
		depth += dist;
		p = ro + rd * depth;

		if(abs(dist) < MIN_VALUE) break;
	}

	float MatID = 1.0;

	if(dist < MIN_VALUE)
	{
		vec3 n = gn(p);
		float outDepth = CalcDepth(p);

		col = vec3(1.0);

		gPosition = vec4(p, 1.0);
		gNormal = vec4(n, 1.0);
		gAlbedo = vec4(col, 1.0);
		gDepth = vec4(vec3(outDepth), 1.0);
		gParam_1 = vec4(MatID, 0.0, 0.0, 1.0);

		gl_FragDepth = outDepth;
	}
	else
	{
		discard;
	}
}