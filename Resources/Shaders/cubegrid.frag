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
    vec4 patternCol;

	vec2 resolution;
	float time;
	float deltaTime;

	float zLength;
	float lowGridRadius;
	float placeMode;
	float someTallMode;

	float ceilingOffsset;
	float usePattern;
	float glowPower;
	float expandRadius;

	float LightParam;
	float fPad0;
	float fPad1;
	float fPad2;
} fragUbo;

#define repeat(p, a) mod(p, a) - a * 0.5

struct MatInfo
{
	float Dist;
	float MatID;
	vec3 Albedo;
};

MatInfo getMin(MatInfo src, float d, float MatID, vec3 a)
{
	MatInfo dst = src;

	if(d < dst.Dist)
	{
		dst.Dist = d;
		dst.MatID = MatID;
		dst.Albedo = a;
	}

	return dst;
}

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

MatInfo map(vec3 p, vec3 gridCenter)
{
	MatInfo Info;
	Info.Dist = 1e5;
	Info.MatID = 0;
	Info.Albedo = vec3(0.0);

	vec3 pos0 = p;
	float hegiht = rand(gridCenter.xz) * 0.5 + 0.5;
	hegiht *= 2.0;

	float width = GRID_INTERVAL * 0.5;

	vec3 Albedo = vec3(1.0);
	float MatID = 2.0;

	if(floor(fragUbo.placeMode) == 0.0) // Sphereに配置
	{
		// if(length(gridCenter.xz) < 5.0)
		if(length(gridCenter.xz) < fragUbo.lowGridRadius)
		{
			float tmpH = hegiht * 0.1;

			/*if(floor(fragUbo.someTallMode) == 1.0)
			{
				float flag = rand(vec2(gridCenter.x * 10.0 + gridCenter.z, gridCenter.z * 10.0 + gridCenter.x)) * 0.5 + 0.5;
				if(step(0.995, flag) == 1.0)
				{
					tmpH = hegiht * 0.5;

					vec3 RCol = vec3(
						rand(gridCenter.xz + vec2(0.971, 0.432)) * 0.5 + 0.5,
						rand(gridCenter.zx + vec2(11.111, 55.6)) * 0.5 + 0.5,
						rand(gridCenter.xz *2.0 + vec2(9.999)) * 0.5 + 0.5
					);
					Albedo = 2.0 * RCol;
					MatID = 4.0;
				}
			}*/

			hegiht = tmpH;
		}

		if(length(gridCenter.xz) < fragUbo.expandRadius)
		{
			float power = 0.25;
			float tmpH = min(0.5, exp((fragUbo.expandRadius - length(gridCenter.xz))) * power);
			hegiht += tmpH;
		}
	}
	else if(floor(fragUbo.placeMode) == 1.0) // Cubeに配置
	{
		if(length(max(vec2(0.0), abs(gridCenter.xz) - fragUbo.placeCubeSize.xy)) < MIN_VALUE)
		{
			hegiht = hegiht * 0.1;
		}
	}

	float d0 = sdBox(pos0 + vec3(0.0, 2.5, 0.0), vec3(width, hegiht, width) );
	Info = getMin(Info, d0, MatID, Albedo);

	d0 = sdBox(pos0 - vec3(0.0, 2.5 + fragUbo.ceilingOffsset, 0.0), vec3(width, hegiht, width) );
	Info = getMin(Info, d0, MatID, Albedo);

	return Info;
}

vec3 gn(vec3 p, vec3 gridCenter)
{
	vec2 e = vec2(MIN_VALUE, 0.0);
	return normalize(vec3(
		map(p + e.xyy, gridCenter).Dist - map(p - e.xyy, gridCenter).Dist,
		map(p + e.yxy, gridCenter).Dist - map(p - e.yxy, gridCenter).Dist,
		map(p + e.yyx, gridCenter).Dist - map(p - e.yyx, gridCenter).Dist
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

// https://github.com/i-saint/RaymarchingOnUnity5/blob/master/Assets/Raymarching/Raymarcher.shader
vec2 DrawPattern(vec2 p)
{
    p=fract(p);
    float r = 0.123;
    float v=0.0,g=0.0;
    r=fract(r*9184.928);
    float cp,d;
    
    d=p.x;
    g+=pow(clamp(1.0-abs(d), 0.0, 1.0), 1000.0);
    d=p.y;
    g+=pow(clamp(1.0-abs(d), 0.0, 1.0), 1000.0);
    d=p.x - 1.0;
    g+=pow(clamp(3.0-abs(d), 0.0, 1.0), 1000.0);
    d=p.y - 1.0;
    g+=pow(clamp(1.0-abs(d), 0.0, 1.0), 10000.0);
    
    const int ITER = 12;
    for(int i=0; i<ITER; i++)
    {
      cp=0.5+(r-0.5)*0.9;
      d=p.x-cp;
      g+=pow(clamp(1.0-abs(d), 0.0, 1.0), 200.0);
      if(d>0.0)
      {
          r=fract(r*4829.013);
          p.x=(p.x-cp)/(1.0-cp);
          v+=1.0;
      }
      else
      {
          r=fract(r*1239.528);
          p.x=p.x/cp;
      }
      p=p.yx;
    }
    
    v/=float(ITER);
    return vec2(g,v);
}

void main()
{
	vec2 st = v2f_UV * 2.0 - 1.0;
	st.x *= (fragUbo.resolution.x / fragUbo.resolution.y);
	
	vec3 ro = (fragUbo.invModel * fragUbo.cameraPos).xyz;
    vec3 rd = normalize(v2f_ObjectPos.xyz - ro);

	// カメラのオフセット分を追加する。これがないと原点として扱われる
	ro += fragUbo.cameraPos.xyz;

	float depth = 0.0, lenToNextGrid = 0.0;
	vec3 p = ro + rd * depth;
	vec3 gridCenter;
	vec2 normalizeRdXZ = normalize(rd.xz);
	float gridLenMultiplier = 1.0 / length(rd.xz);

	MatInfo Info;
	Info.Dist = 1e5;
	Info.MatID = 0.0;
	Info.Albedo = vec3(0.0);

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

		Info = map(p - gridCenter, gridCenter);
		depth += Info.Dist;
		p = ro + rd * depth;

		if(abs(Info.Dist) < MIN_VALUE) break;
	}

	float Metallic = 0.1;
	float Roughness = 0.0;

	if(Info.Dist < MIN_VALUE)
	{
		vec3 n = gn(p - gridCenter, gridCenter);
		float outDepth = CalcDepth(p);

		// GlowPattern
		if(floor(fragUbo.usePattern) == 1.0)
		{
			vec3 GlowCol = vec3(0.0);

			for(int i = 0; i < 3; i++)
			{
				vec2 target = vec2(0.0);
				if((i == 0)) target = p.xy * 0.5;
				else if((i == 1)) target = p.yz * 0.5;
				else if((i == 2)) target = p.xz * 0.5;

				vec2 gp = DrawPattern(target);
				float glow = 0.0;
				glow += gp.x;
				if(gp.x < 1.3) glow = 0.0;

				GlowCol += vec3(glow);
			}

			GlowCol = clamp(GlowCol, 0.0, 1.0);

			if(length(GlowCol) > 0.0)
			{
				Info.Albedo = fragUbo.patternCol.rgb * fragUbo.glowPower;
				Info.MatID = 4.0;
			}
		}

		gPosition = vec4(p, 1.0);
		gNormal = vec4(n, 1.0);
		gAlbedo = vec4(Info.Albedo, 1.0);
		gDepth = vec4(vec3(outDepth), 1.0);
		gParam_1 = vec4(Info.MatID, fragUbo.LightParam, Metallic, Roughness);

		gl_FragDepth = outDepth;
	}
	else
	{
		discard;
	}
}