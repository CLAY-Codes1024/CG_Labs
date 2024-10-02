#version 410

in  VS_OUT {
    vec3 posWS;
    vec3 coord;
    vec3 normalWS;
    vec3 tangentWS;
    vec3 binormalWS;
    vec2 bumpCoord[3];
}fs_in;

uniform float elapsed_time;
uniform vec3 camera_position;
uniform vec3 light_position;

uniform sampler2D normal_map;
uniform samplerCube skybox_map;

vec4 colorDeep = vec4(0.0, 0.0, 0.1, 1.0) ;
vec4 colorShallow = vec4(0.0, 0.5, 0.5, 1.0);

out vec4 FragColor;

void main() {
    vec3 L = normalize(light_position - fs_in.posWS);
    vec3 V = normalize(camera_position - fs_in.posWS);
    
    // construct tbn matrix
    mat3 tbn = mat3(normalize(fs_in.tangentWS), normalize(fs_in.binormalWS), normalize(fs_in.normalWS));
    // sample the normal map
    // you should remap every sampling
    vec3 normal = texture(normal_map, fs_in.bumpCoord[0]).xyz * 2.0 - 1.0 +
             texture(normal_map, fs_in.bumpCoord[1]).xyz * 2.0 - 1.0 +
             texture(normal_map, fs_in.bumpCoord[2]).xyz * 2.0 - 1.0;
    // don't forget to remap
    //vec3 normalWS = tbn * normalize(normal * 2.0 - 1.0);
    vec3 normalWS = tbn * normalize(normal);

    // ambient
    float facing = 1.0 - max(dot(V, normalWS), 0);
    vec4 ambient_color = mix(colorDeep, colorShallow, facing);
    
    // fresnel terms
    float r0 = 0.02037;
    float fresnel = r0 + (1 - r0) * pow((1-max(dot(V, normalWS),0)), 5);

    // reflection
    vec3 reflectDir = reflect(-V, normalWS);
    vec4 reflection = texture(skybox_map, reflectDir);

    // refraction
    float etaA2W = 1.0/1.33;
    float etaW2A = 1.33/1.0;
    vec3 refracDir = refract(-V, normalWS, etaA2W);
    vec4 refraction = texture(skybox_map, refracDir);

    //FragColor = texture(normal_map, fs_in.coord.xy);
    //FragColor = ambient_color; 
    //FragColor = ambient_color + reflection;
    //FragColor = ambient_color + reflection * fresnel;
    // check the refraction
    // FragColor = refraction * (1-fresnel);
    FragColor = ambient_color + reflection * fresnel + refraction * (1-fresnel);
}