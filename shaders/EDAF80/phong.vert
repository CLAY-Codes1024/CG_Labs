#version 410

layout (location = 0) in vec3 pos;
layout (location = 1) in vec3 normal;
layout (location = 2) in vec3 texCoord;
layout (location = 3) in vec3 tangent;
layout (location = 4) in vec3 binormal;

uniform mat4 vertex_model_to_world;
uniform mat4 vertex_world_to_clip;

out VS_OUT {
    vec3 posWS;
    vec3 normalWS;
    vec3 texCoord;
    vec3 tangentWS;
    vec3 binormalWS;
}vs_out;

void main() {
    // pass the data to frag shader
    vs_out.posWS = (vertex_model_to_world * vec4(pos, 1.0f)).xyz;
    vs_out.normalWS = (vertex_model_to_world * vec4(normal, 1.0f)).xyz;
    vs_out.tangentWS = (vertex_model_to_world * vec4(tangent, 1.0f)).xyz;
    vs_out.binormalWS = (vertex_model_to_world * vec4(binormal, 1.0f)).xyz;
    vs_out.texCoord = texCoord;

    gl_Position = vertex_model_to_world * vertex_world_to_clip * vec4(pos, 1.0f);
}