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
    vec4 objPos;
    vec4 param1;

	vec2 resolution;
	float time;
	float deltaTime;
	float zLength;
	float tparam;

	float LightParam;
	float rate;
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

vec2 pmod(vec2 p, float s)
{
    float n = pi * 2.0 / s;
    float a = atan(p.x, p.y) + n * 0.5;
    a = floor(a / n) * n;
    return p * rot(-a);
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

	p.y += 1.0;

	p += fragUbo.objPos.xyz;

	p.xy *= rot(fragUbo.time);
    p.yz *= rot(fragUbo.time);
    p.xz *= rot(fragUbo.time);
    
    vec3 pos = p;
    // pos = abs(pos);

	float d = sdBox(pos, vec3(0.25));

	if(fragUbo.rate > 0.0)
	{
		pos.xy = pmod(pos.xy, 8.0);
		pos.xz = pmod(pos.xz, 3.0);
		
		float sp = 0.25;
		float at = floor(fragUbo.time * sp) + pow(fract(fragUbo.time * sp), 0.15);
		
		for(int i = 0; i < 3; i++)
		{
			// pos = abs(pos) - 0.1;
			pos = abs(pos) - 0.1;
			if(pos.x < pos.y) pos.xy = pos.yx;
			if(pos.x < pos.z) pos.xz = pos.zx;
			if(pos.y < pos.z) pos.yz = pos.zy;
			
			pos.xy *= rot(at);
			pos.xz *= rot(at);
			
			// pos.yz = abs(pos.yz) - 0.1;
			
			pos.xz *= rot(at);
			
			// pos -= 0.1;
		}
		
		float tmpd = sdBox(pos, vec3(0.1, 0.75, 0.1) * 0.5);

		d = mix(d, tmpd, fragUbo.rate);
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

	int itr = 0;

	for(int i = 0; i < 64; i++)
	{
		Info = map(p);
		depth += Info.d * 0.5;
		p = ro + rd * depth;

		itr = i;

		if(abs(Info.d) < MIN_VALUE) break;
	}

	if(Info.d < MIN_VALUE)
	{
		vec3 n = gn(p);
		float outDepth = CalcDepth(p);

		col = fragUbo.mainColor.rgb;

		col = vec3(0.615, 0.8, 0.88) * 10.0 / itr;

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