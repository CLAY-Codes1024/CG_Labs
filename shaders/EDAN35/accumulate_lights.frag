#version 410
const float shadowMapOffset = 0.00001;
const int pcfCount = 2;
const float totalTexel = (pcfCount * 2 + 1) * (pcfCount * 2 + 1);

struct ViewProjTransforms
{
	mat4 view_projection;
	mat4 view_projection_inverse;
};

layout (std140) uniform CameraViewProjTransforms
{
	ViewProjTransforms camera;
};

layout (std140) uniform LightViewProjTransforms
{
	ViewProjTransforms lights[4];
};

in vec3 fragPositionWS;

uniform int light_index;

uniform sampler2D depth_texture;
uniform sampler2D normal_texture;
uniform sampler2D shadow_texture;

uniform vec2 inverse_screen_resolution;

uniform vec3 camera_position;

uniform vec3 light_color;
uniform vec3 light_position;
uniform vec3 light_direction;
uniform float light_intensity;
uniform float light_angle_falloff;
uniform float light_angle_outerFalloff;

vec2 calSpotLightCoefficient(vec3 pixelPositionWS, vec3 viewDir, vec3 normal);

layout (location = 0) out vec4 light_diffuse_contribution;
layout (location = 1) out vec4 light_specular_contribution;

void main()
{
	vec2 uv = gl_FragCoord.xy * inverse_screen_resolution;

	// two ways to calculate pixel postion in wrold space
	vec3 pixelPosNDC;
	pixelPosNDC.xy = 2.0 * uv - 1.0;
	pixelPosNDC.z = 2.0 * texture(depth_texture, uv).r - 1.0;
	vec4 pixelPosCS = vec4(pixelPosNDC, 1.0) / gl_FragCoord.w;
	// wrong: vec3 pixelPosWS = mat3(camera.view_projection_inverse) * pixelPosCS;
	// you can't remove the translation of the view_projection_inverse, you have to keep the
	// homogeneous coordinate
	vec3 pixelPosWS = vec3(camera.view_projection_inverse * pixelPosCS);

	// or I can do
	vec4 pixelPosCS2 = vec4(pixelPosNDC, 1.0f);
	vec4 almostPosWS = camera.view_projection_inverse * pixelPosCS2;
	vec3 pixelPosWS2 = almostPosWS.xyz / almostPosWS.w;

	// info for light calculation
	vec3 viewDir = normalize(camera_position - pixelPosWS2);
	vec3 normal = normalize(2.0 * texture(normal_texture, uv).xyz - 1.0);
	vec2 dsContri = calSpotLightCoefficient(pixelPosWS2, viewDir, normal);

	// shadow
	// clip space
	// wrong: vec4 pixelPosSM = lights[light_index].view_projection * vec4(pixelPosWS, 1.0);
	vec4 pixelPosSM = lights[light_index].view_projection * camera.view_projection_inverse * pixelPosCS;
	// ndc space
	vec3 projCoord = pixelPosSM.xyz / pixelPosSM.w;
	// range in [-1,1], need to remap tp [0,1]
	projCoord = projCoord * 0.5 + 0.5;
	// read depth value from shadow map, that is range from [0,1]

	// pcf - percentage closer filtering
	float total = 0.0;
	vec2 shadowmap_texel_size = 1.0f / textureSize(shadow_texture, 0); // this is for pcf
	// sampler the pixel around the center pixel
	for(int xOffset=-pcfCount; xOffset<pcfCount; xOffset++)
	{
		for(int yOffset=-pcfCount; yOffset<pcfCount; yOffset++)
		{
			// sampler the shadow map
			float closestDepth = texture(shadow_texture, projCoord.xy + vec2(xOffset, yOffset) * shadowmap_texel_size).r + shadowMapOffset;
			// determing it's in shadow or not
			float shadow = projCoord.z > closestDepth ? 1.0 : 0.0;
			total += (1.0 - shadow);
		}
	}
	// average the shadow value;
	float pcfShadow = total / totalTexel;
	light_diffuse_contribution  = vec4(vec3(dsContri.x) * pcfShadow * light_color, 1.0);
	light_specular_contribution = vec4(vec3(dsContri.y) * pcfShadow * light_color, 1.0);

	// normal way to sampler shadow, hard edge
	//float closestDepth = texture(shadow_texture, projCoord.xy).r + shadowMapOffset;
	// it seems like every projCoord.z is greater than z value that I read from the shadow map
	// cause I got wrong pixel position in shadow map
	//float shadow = projCoord.z > closestDepth ? 1.0 : 0.0;

	//light_diffuse_contribution  = vec4(vec3(dsContri.x) * (1.0 - shadow) * light_color, 1.0);
	//light_specular_contribution = vec4(vec3(dsContri.y) * (1.0 - shadow) * light_color, 1.0);

	//vec3 diffuseContri = dsContri.x * light_intensity * light_color;
	//vec3 specContri = dsContri.y * light_intensity * light_color;
	//light_diffuse_contribution  = vec4(diffuseContri, shadow);
	//light_specular_contribution = vec4(specContri, shadow);
}

vec2 calSpotLightCoefficient(vec3 pixelPositionWS, vec3 viewDir, vec3 normal)
{
	// calculate the theta between pixel world position and light dir
	vec3 light2pixel = normalize(pixelPositionWS - light_position);
	float theta = dot(light2pixel, light_direction);
	float epsilon = cos(light_angle_falloff) - cos(light_angle_outerFalloff);
	float intensity = clamp((theta - cos(light_angle_outerFalloff))/epsilon, 0.0, 1.0);
	float distance = 1 / pow(length(light2pixel), 2.0);
	// just black
	//float distance = 1 / pow(length(pixelPositionWS - light_position), 2.0);

	if (theta > cos(light_angle_outerFalloff))
	{
		// diffuse
		float diff = distance * intensity * max(dot(-light2pixel, normal), 0.0f);
		// specular
		vec3 halfVec = normalize(viewDir - light2pixel);
		float spec = distance * intensity * pow(max(dot(halfVec, normal), 0.0), 128.0);

		return vec2(diff, spec);
	}
	else
		return vec2(0.0, 0.0);
}
