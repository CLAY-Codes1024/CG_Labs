#version 410

in VS_OUT {
    vec3 posWS;
    vec3 camera_pos;
}fs_in;

uniform samplerCube cubemap;

out vec4 FragColor;

void main() {
    vec3 coord = normalize(fs_in.posWS - fs_in.camera_pos);
    //vec3 coord = normalize(fs_in.posWS);
    FragColor = texture(cubemap, coord);
}