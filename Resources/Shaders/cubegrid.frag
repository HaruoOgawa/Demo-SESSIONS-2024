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
    vec4 v4Pad1;
    vec4 v4Pad2;

	vec2 resolution;
	float time;
	float deltaTime;
	float zLength;
	float fpad0;
} fragUbo;

#define repeat(p, a) mod(p, a) - a * 0.5
#define gmin(dst, src) dst = min(dst, src)

//
const float MIN_VALUE = 1E-3;

// グリッドの間隔
const float GRID_INTERVAL = 0.25;

//
float rand(vec2 st)
{
	return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453123) * 2.0 - 1.0;
}

float sdBox(vec3 p, vec3 s)
{
	return length(max(vec3(0.0), abs(p) - s));
}

float map(vec3 p, vec3 gridCenter)
{
	float d = 1e5;

	vec3 pos0 = p;
	float hegiht = rand(gridCenter.xz) * 0.5 + 0.5;
	hegiht *= 2.0;

	float width = GRID_INTERVAL * 0.5;

	if(length(gridCenter.xz) < 5.0)
	{
		hegiht = 0.0;
	}

	float d0 = sdBox(pos0 + vec3(0.0, 2.5, 0.0), vec3(width, hegiht, width) );
	gmin(d, d0);

	d0 = sdBox(pos0 - vec3(0.0, 2.5, 0.0), vec3(width, hegiht, width) );
	gmin(d, d0);

	return d;
}

vec3 gn(vec3 p, vec3 gridCenter)
{
	vec2 e = vec2(MIN_VALUE, 0.0);
	return normalize(vec3(
		map(p + e.xyy, gridCenter) - map(p - e.xyy, gridCenter),
		map(p + e.yxy, gridCenter) - map(p - e.yxy, gridCenter),
		map(p + e.yyx, gridCenter) - map(p - e.yyx, gridCenter)
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

// grid traversal
// https://www.shadertoy.com/view/stdXWH
/**
 * do grid traversal
 * returns vec3( center of the grid, distance to the next grid )
 */
 vec3 traverseGrid2D(vec2 ro, vec2 rd)
 {
	// グリッドの中心位置を求める
	vec2 grid = floor( (ro + rd * 1E-2 * GRID_INTERVAL) / GRID_INTERVAL ) * GRID_INTERVAL + 0.5 * GRID_INTERVAL;

	// 次のグリッドまでの距離を求める(b)
	vec2 src = ( ro - grid ) / rd;
	vec2 dst = abs( 0.5 * GRID_INTERVAL / rd );
	vec2 bv = -src + dst;
	float b = min(bv.x, bv. y);

	return vec3( grid, b );
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
	vec3 gridCenter;
	vec2 normalizeRdXZ = normalize(rd.xz);
	float gridLenMultiplier = 1.0 / length(rd.xz);

	for(int i = 0; i < 256; i++)
	{
		if(depth >= lenToNextGrid)
		{
			// grid traversal
			// https://www.shadertoy.com/view/stdXWH
			// 次のグリッドまで届いていたら現在のグリッドに収まるように丸め込む
			depth = lenToNextGrid;
			p = ro + rd * depth;

			vec3 grid = traverseGrid2D( p.xz, normalizeRdXZ);
			gridCenter = vec3(grid.x, 0.0, grid.y);
			lenToNextGrid += grid.z * gridLenMultiplier;
		}

		dist = map(p - gridCenter, gridCenter);
		depth += dist;
		p = ro + rd * depth;

		if(abs(dist) < MIN_VALUE) break;
	}

	float MatID = 2.0;
	float UseLightPos = 1.0;
	float Metallic = 0.25;
	float Roughness = 1.0;

	if(dist < MIN_VALUE)
	{
		vec3 n = gn(p - gridCenter, gridCenter);
		float outDepth = CalcDepth(p);

		col = vec3(1.0);

		gPosition = vec4(p, 1.0);
		gNormal = vec4(n, 1.0);
		gAlbedo = vec4(col, 1.0);
		gDepth = vec4(vec3(outDepth), 1.0);
		gParam_1 = vec4(MatID, UseLightPos, Metallic, Roughness);

		gl_FragDepth = outDepth;
	}
	else
	{
		// gDepth = vec4(1.0);
		discard;
	}
}