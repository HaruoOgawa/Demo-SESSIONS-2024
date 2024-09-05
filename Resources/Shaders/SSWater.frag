#version 450

layout(location = 0) in vec4 v2f_ObjectPos;
layout(location = 1) in vec2 v2f_UV;

/*layout(location = 0) out vec4 gPosition;
layout(location = 1) out vec4 gNormal;
layout(location = 2) out vec4 gAlbedo;
layout(location = 3) out vec4 gDepth;
layout(location = 4) out vec4 gParam_1; */

layout(location = 0) out vec4 outColor;

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
	float baseHeight;
	float WaterWidth;
	float WaterHeight;
} fragUbo;

#ifdef USE_OPENGL
layout(binding = 2) uniform sampler2D texImage;
layout(binding = 4) uniform sampler2D depthImage;
layout(binding = 6) uniform sampler2D posImage;
layout(binding = 8) uniform sampler2D normalImage;
layout(binding = 10) uniform sampler2D metallicRoughnessImage;
#else
layout(binding = 2) uniform texture2D texImage;
layout(binding = 3) uniform sampler texSampler;
layout(binding = 4) uniform texture2D depthImage;
layout(binding = 5) uniform sampler depthSampler;
layout(binding = 6) uniform texture2D posImage;
layout(binding = 7) uniform sampler posSampler;
layout(binding = 8) uniform texture2D normalImage;
layout(binding = 9) uniform sampler normalSampler;
layout(binding = 10) uniform texture2D metallicRoughnessImage;
layout(binding = 11) uniform sampler metallicRoughnessSampler;
#endif

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

// Simplex Noise: https://www.shadertoy.com/view/Msf3WH
vec2 hash( vec2 p ) // replace this by something better
{
	p = vec2( dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)) );
	return -1.0 + 2.0*fract(sin(p)*43758.5453123);
}

float noise( in vec2 p )
{
    const float K1 = 0.366025404; // (sqrt(3)-1)/2;
    const float K2 = 0.211324865; // (3-sqrt(3))/6;

	vec2  i = floor( p + (p.x+p.y)*K1 );
    vec2  a = p - i + (i.x+i.y)*K2;
    float m = step(a.y,a.x); 
    vec2  o = vec2(m,1.0-m);
    vec2  b = a - o + K2;
	vec2  c = a - 1.0 + 2.0*K2;
    vec3  h = max( 0.5-vec3(dot(a,a), dot(b,b), dot(c,c) ), 0.0 );
	vec3  n = h*h*h*h*vec3( dot(a,hash(i+0.0)), dot(b,hash(i+o)), dot(c,hash(i+1.0)));
    return dot( n, vec3(70.0) );
}

MatInfo map(vec3 p)
{
	MatInfo Info;
	Info.d = 1e5;
	Info.MatID = -1;
	Info.metallic = 0.0;
	Info.roughness = 0.0;

	vec2 st = vec2(0.0);

	/*if(true)
	{
		// ‹ÉÀ•W•ÏŠ·
		float r = length(p.xz);
		float t = atan(p.x, p.z);

		st = vec2(r - fragUbo.time, t);
	}
	else*/
	{
		st = p.xz + fragUbo.time * 0.1;
	}

	float h = noise(st * fragUbo.WaterWidth) * fragUbo.WaterHeight;

	float d = p.y - fragUbo.baseHeight - h;
	Info = getMin(Info, d, 2.0, 0.9, 1.0);

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
	vec3 col = vec3(0.0, 0.0, 0.0);
	
	vec2 st = v2f_UV * 2.0 - 1.0;
	st.x *= (fragUbo.resolution.x / fragUbo.resolution.y);
	
	vec3 ro = fragUbo.cameraPos.xyz;
    vec3 rd = normalize((fragUbo.view * inverse(fragUbo.proj) * vec4(st, 1.0, 1.0)).xyz);

	//ro += fragUbo.cameraPos.xyz;

	float SceneDepth = GetDepth(v2f_UV);

	float depth = 0.0;
	vec3 p = ro + rd * depth;

	MatInfo Info;
	Info.d = 1e5;
	Info.MatID = -1;
	Info.metallic = 0.0;
	Info.roughness = 0.0;

	float CurrentSceneDepth = 0.0;

	for(int i = 0; i < 256; i++)
	{
		Info = map(p);
		depth += Info.d;
		p = ro + rd * depth;

		CurrentSceneDepth = CalcDepth(p);

		if(abs(Info.d) < MIN_VALUE || CurrentSceneDepth > SceneDepth) break;
	}

	float UseLightPos = 1.0;

	if(Info.d < MIN_VALUE && CurrentSceneDepth <= SceneDepth)
	{
		vec3 n = gn(p);
		float outDepth = CalcDepth(p);

		col = fragUbo.mainColor.rgb;

		/*gPosition = vec4(p, 1.0);
		gNormal = vec4(n, 1.0);
		gAlbedo = vec4(col, 1.0);
		gDepth = vec4(vec3(outDepth), 1.0);
		gParam_1 = vec4(Info.MatID, UseLightPos, Info.metallic, Info.roughness);*/

		outColor = vec4(col, 1.0);

		//gl_FragDepth = outDepth;
	}
	else
	{
		discard;
	}
}