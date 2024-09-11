#version 410

in VS_OUT {
    vec3 posWS;
    vec3 normal;
    vec3 texCoord;
    vec3 tangent;
    vec3 binormal;
} fs_in;

uniform vec3 camera_position;
uniform vec3 light_position;

uniform sampler2D diffuse_texture;
uniform sampler2D specular_texture;
uniform sampler2D normal_texture;

uniform float specular_shininess;

uniform bool use_normal_mapping;

out vec4 FragColor;

void main() {

    vec3 L = normalize(light_position - fs_in.posWS);
    vec3 V = normalize(camera_position - fs_in.posWS);

    // construct tbn matrix

    // get the normal value from the normal map

    // ambient
    vec4 ambient_color = vec4(0.1, 0.2, 0.1, 1.0f);

    // diffuse
    vec4 diffuse_color = texture(diffuse_texture, fs_in.texCoord.xy);
    vec4 diffuse_color_component = diffuse_color * clamp(max(dot(L, fs_in.normal), 0.0f),0.0f, 1.0f);

    // specular
    vec4 specular_color = texture(specular_texture, fs_in.texCoord.xy);
    vec4 specular_color_component = specular_color * pow(clamp(max(dot(reflect(-L, fs_in.normal), V), 0.0f), 0.0f, 1.0f), specular_shininess);

    //FragColor = vec4(specular_shininess, 0.0, 0.0, 1.0);
    //FragColor = texture(diffuse_texture, fs_in.texCoord.xy);
    //FragColor = ambient_color + diffuse_color_component + specular_color_component;
    FragColor = diffuse_color_component + specular_color_component;
}