#version 410

uniform sampler2D diffuse_texture;
uniform sampler2D specular_texture;
uniform sampler2D light_d_texture;
uniform sampler2D light_s_texture;

layout (pixel_center_integer) in vec4 gl_FragCoord;

out vec4 frag_color;

void main()
{
	ivec2 pixel_coord = ivec2(gl_FragCoord.xy);

	vec3 diffuse  = texelFetch(diffuse_texture,  pixel_coord, 0).rgb;
	vec3 specular = texelFetch(specular_texture, pixel_coord, 0).rgb;

	vec3 light_d  = texelFetch(light_d_texture,  pixel_coord, 0).rgb;
	vec3 light_s  = texelFetch(light_s_texture,  pixel_coord, 0).rgb;
	float shadow = texelFetch(light_d_texture, pixel_coord, 0).a;
	const vec3 ambient = vec3(0.15);

	// wrong: texelFetch won't exactly sampler the point that we calculate in accumulate_light.frag
	//frag_color =  vec4((ambient + light_d * (1.0 - shadow)) * diffuse + light_s * (1.0 - shadow) * specular, 1.0);
	frag_color =  vec4((ambient + light_d)  * diffuse + light_s * specular, 1.0);
}
