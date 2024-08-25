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

vec2 pmod(vec2 p, float seg)
{
	float n = pi2 / seg;
	float a = atan(p.x, p.y) + n * 0.5;
	a = floor(a / n) * n;
	return p * rot(-a);
}

float map(vec3 p)
{
	float Dst = 1e5;

	

	/*{
		vec3 pos = p;

		pos.xy *= rot(pi * 0.25);
		float d = sdTorus(pos , vec2(2.5, 0.025) );
		gmin(Dst, d);
	}

	{
		vec3 pos = p;

		pos.xy *= rot(pi * -0.25);
		float d = sdTorus(pos , vec2(2.0, 0.025) );
		gmin(Dst, d);
	}*/

	{

		
		
		float offset = 1.0;
		float angle = 0.0;
		// float expand = 1.0 + sin(fragUbo.time * 0.1) * 0.25;
		float rateE = (sin(fragUbo.time * 0.5) * 0.5 + 0.5);
		float rateA = (sin(fragUbo.time * 2.0) * 0.5 + 0.5);
		float expand = 1.0 - rateE * 0.5;


		for(int i = 0; i < 15; i++)
		{
			vec3 pos = p;
			pos *= expand;
			pos.xy *= rot(fragUbo.time);
			pos.yz *= rot(fragUbo.time);
			pos.xz *= rot(fragUbo.time);
			
			pos.xy *= rot(angle);
			pos.yz *= rot(angle);
			pos.xz *= rot(angle);

			pos = abs(pos);
			pos -= offset;
			if(pos.x < pos.y) pos.xy = pos.yx;
			if(pos.x < pos.z) pos.xz = pos.zx;
			if(pos.y < pos.z) pos.yz = pos.zy;

			float d = length(pos.xy) - 0.01;
			gmin(Dst, d);

			offset *= 0.99;
			// angle += 0.05;
			angle += 0.01 + rateA * 0.04;
		}


		// float scale = 1.0;

		// for(int i = 0; i < 6; i++)
		// {
		// 	pos.xy *= rot(pi * -0.25);

		// 	float d = sdTorus(pos/ scale , vec2(2.0, 0.02) );
		// 	gmin(Dst, d);

		// 	scale *= 0.8;
		// 	pos *= 0.8;
		// }
	}

	{
		vec3 pos = p;
			pos.xy *= rot(-fragUbo.time);
			pos.yz *= rot(-fragUbo.time);
			pos.xz *= rot(-fragUbo.time);

		// 直角Fold
		pos = abs(pos);
		
		float sum = 1.0;

		for(int i = 0; i < 3; i++)
		{
			pos = abs(pos) - vec3(fragUbo.param0.w);
			// pos.xy = pmod(pos.xy, 3.0);
			if(pos.x < pos.y) pos.xy = pos.yx;
			if(pos.x < pos.z) pos.xz = pos.zx;
			if(pos.y < pos.z) pos.yz = pos.zy;

			// pos = abs(pos) - vec3(0.2, 0.2, 0.2);

			float sc = clamp(max(0.0, 2.0 / dot(p, p)), 0.0, 4.0);
			// float sc = 2.0;
			pos *= sc;
			sum *= sc;
			
			pos.xy -= 0.2;

			pos.xy *= rot(fragUbo.param0.x);
			pos.yz *= rot(fragUbo.param0.y);
			pos.xz *= rot(fragUbo.param0.z);

			// pos = abs(pos);
			// pos.xy -= 0.05;
		}

		float h = fragUbo.param1.x;
		pos.x -= clamp(pos.x, -h, h);

		// sum = abs(sum);

		pos /= sum;

		// float d = length(pos) / sum - 0.02;
		float d = sdTorus(pos , vec2(0.5, 0.05) );
		// float d = sdBox(pos, vec3(0.25));
		gmin(Dst, d);
	}

	{
		vec3 pos = p;
		float d = length(pos) - 0.5;
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