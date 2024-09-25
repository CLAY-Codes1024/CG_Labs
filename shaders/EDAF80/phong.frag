#version 410

uniform int has_normal_map;

in VS_OUT {
    vec3 posWS;
    vec3 normalWS;
    vec3 texCoord;
    vec3 tangentWS;
    vec3 binormalWS;
} fs_in;

uniform vec3 camera_position;
uniform vec3 light_position;

uniform sampler2D diffuse_map;
uniform sampler2D specular_map;
uniform sampler2D normal_map;

uniform float specular_shininess;

uniform int use_normal_mapping;

out vec4 FragColor;

void main() {

    // basic vectors set up
    vec3 L = normalize(light_position - fs_in.posWS);
    vec3 V = normalize(camera_position - fs_in.posWS);
    vec3 normal = fs_in.normalWS;

    if((use_normal_mapping != 0) && (has_normal_map != 0)) {
        // construct tbn matrix
        mat3 tbn = mat3(normalize(fs_in.tangentWS), normalize(fs_in.binormalWS), normalize(fs_in.normalWS));
        // get the normal value from the normal map and map from 0-1 to -1-1
        normal = tbn * (texture(normal_map, fs_in.texCoord.xy).xyz * 2.0f - 1.0f);
    }

    // ambient
    vec4 ambient_color = vec4(0.1, 0.2, 0.1, 1.0f);

    // diffuse
    vec4 diffuse_color = texture(diffuse_map, fs_in.texCoord.xy);
    vec4 diffuse_color_component = diffuse_color * clamp(max(dot(L, normal), 0.0f),0.0f, 1.0f);

    // specular
    vec4 specular_color = texture(specular_map, fs_in.texCoord.xy);
    vec4 specular_color_component = specular_color * pow(clamp(max(dot(reflect(-L, normal), V), 0.0f), 0.0f, 1.0f), specular_shininess);

    //FragColor = vec4(specular_shininess, 0.0, 0.0, 1.0);
    //FragColor = texture(diffuse_map, fs_in.texCoord.xy);
    //FragColor = ambient_color + diffuse_color_component + specular_color_component;
    FragColor = diffuse_color_component + specular_color_component;
}