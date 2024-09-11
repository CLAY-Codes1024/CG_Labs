#version 410

layout (location = 0) in vec3 pos;

uniform mat4 vertex_model_to_world;
uniform mat4 vertex_world_to_clip;
uniform vec3 camera_position;

out VS_OUT {
    vec3 posWS;
    vec3 camera_pos;
}vs_out;

void main() {
    vec4 posWS = vertex_model_to_world * vec4(pos, 1.0f);

    posWS.xyz += camera_position;

    vs_out.posWS = posWS.xyz;
    vs_out.camera_pos = camera_position;

    gl_Position = vertex_world_to_clip * posWS;
}