#version 450

layout(location = 0) in vec2 v2f_UV;

layout(location = 0) out vec4 outColor;

layout(binding = 0) uniform FragUniformBufferObject{
	mat4 mPad0;
	mat4 mPad1;
	mat4 mPad2;
	mat4 mPad3;

	vec2 resolution;
	float time;
	float deltaTime;

    vec4 baseColor;

    float pmodcount;
    float offset;
    float rotyz;
    float rotxz;
} fragUbo;

#define PI 3.14159265
#define rot(a) mat2(cos(a),sin(a),-sin(a),cos(a))

vec2 pmod(vec2 p,float n)
{
    float a=(2.0*PI)/n;
    float t=atan(p.x,p.y)-PI/n;
    t=mod(t,a)-PI/n;
    return vec2(length(p)*cos(t),length(p)*sin(t));
}

float Cube(vec3 p,float s)
{
    p=abs(p);
    return length(max(p-vec3(s),0.0));
}

float sdCross(vec3 p)
{
    p=abs(p);
    float dxy=max(p.x,p.y);
    float dyz=max(p.y,p.z);
    float dzx=max(p.z,p.x);
    return min(dxy,min(dyz,dzx))-1.0;
}

float map(vec3 p)
{
    p.z+=fragUbo.time;
    
    p.xy=pmod(p.xy,fragUbo.pmodcount);
    float k=4.;
    p=mod(p,k)-0.5*k;
    
    float s=2.0;
    float d=Cube(p,s);
    float scale=fragUbo.offset;
    for(int i=0;i<6;i++)
    {
        p=mod(p,2.0)-1.0;
        s*=scale;
        p=1.0-scale*abs(p);
        d=max(d,sdCross(p)/s);

        p.yz *= rot(fragUbo.rotyz);
        p.xz *= rot(fragUbo.rotxz);
    }

    return d;
}

vec3 gn(vec3 p)
{
    vec2 e = vec2(0.0001, 0.0);
    
    return normalize(vec3(
        map(p + e.xyy) - map(p - e.xyy),
        map(p + e.yxy) - map(p - e.yxy),
        map(p + e.yyx) - map(p - e.yyx)
    ));
}

void main()
{
	vec3 col = vec3(0.0);
	#ifdef USE_OPENGL
	vec2 uv = v2f_UV;
	#else
	vec2 uv = vec2(v2f_UV.x, 1.0 - v2f_UV.y);
	#endif

	vec2 st = uv * 2.0 - 1.0;
    st.x *= (fragUbo.resolution.x / fragUbo.resolution.y);
    
    vec3 ro = vec3(0.0, 0.0, 1.0);
    vec3 rd = normalize(vec3(st, -1.0));
    
    float d = 1.0, t = 0.0, acc = 0.0;
    
    for(int i = 0; i < 64; i++)
    {
        d = map(ro + rd * t);
        if(d < 0.0001) break;
        t += d;
        acc += exp(d);
    }

    col=vec3(exp(-0.5*t));
    col*=fragUbo.baseColor.rgb*acc*0.04;

	outColor = vec4(col, 1.0);
}