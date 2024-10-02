#version 410

layout (location = 0) in vec3 pos;
layout (location = 2) in vec3 coord;

uniform mat4 vertex_model_to_world;
uniform mat4 vertex_world_to_clip;
uniform mat4 normal_model_to_world;

uniform float elapsed_time;
uniform int wave_count;
//uniform vec2 texScale;
//uniform normalSpeed;

out VS_OUT {
    vec3 posWS;
    vec3 coord;
    vec3 normalWS;
    vec3 tangentWS;
    vec3 binormalWS;
    vec2 bumpCoord[3];
}vs_out;

vec2 texScale = vec2(8,4);
float normalTime = mod(elapsed_time, 100.0);
vec2 normalSpeed = vec2(-0.05, 0.0);

struct Wave {
    float yOffset;
    float xDerivative;
    float zDerivative;
};

struct WaveConfig {
    float amplitude;
    vec2 dir;
    float frequency;
    float phase;
    float sharpness;
};

WaveConfig waveConfig[2] = WaveConfig[](
    WaveConfig(1.0, vec2(-1,0), 0.2, 0.5, 2.0),
    WaveConfig(0.5, vec2(-0.7,0.7), 0.4, 1.3, 2.0)
);

Wave computeWave(WaveConfig waveConfig, vec3 pos);

void main() {
    vec3 posMS = pos;

    // construct the waves
    // remeber to init the variable
    float yAccuOffset = 0.0, xAccuDerivative = 0.0, zAccuDerivative = 0.0;
    for(int i=0; i<wave_count; i++) {
        Wave wave = computeWave(waveConfig[i], pos);
        yAccuOffset += wave.yOffset;
        xAccuDerivative += wave.xDerivative;
        zAccuDerivative += wave.zDerivative;
    }

    // pos.y += yAccuOffset; //you can not directly modified the variables from vertex input
    posMS.y += yAccuOffset;

    vec3 posWS = (vertex_model_to_world * vec4(posMS, 1.0f)).xyz;
    vs_out.posWS = posWS;
    vs_out.coord = coord;
    // scale + offset
    vs_out.bumpCoord[0] = coord.xy * texScale + normalTime * normalSpeed;
    vs_out.bumpCoord[1] = coord.xy * texScale * 2 + normalTime * normalSpeed * 4;
    vs_out.bumpCoord[2] = coord.xy * texScale * 4 + normalTime * normalSpeed * 8;

    // compute the tangent, binormal and normal
    vec3 tangent = vec3(1.0, xAccuDerivative, 0.0);
    vec3 binormal = vec3(0.0, zAccuDerivative, 1.0);

    //vec3 normal = cross(tangent, normal);
    vec3 normal = cross(binormal, tangent);

    // transform t,b,n to world space
    //vs_out.tangentWS = (vertex_model_to_world * vec4(tangent,1.0)).xyz;
    //vs_out.binormalWS = (vertex_model_to_world * vec4(binormal, 1.0)).xyz;
    //vs_out.normalWS = (normal_model_to_world * vec4(normal,1.0)).xyz;

    // not transform to world space
    vs_out.tangentWS = tangent;
    vs_out.binormalWS = binormal;
    vs_out.normalWS = normal;


    gl_Position = vertex_world_to_clip * vec4(posWS, 1.0f) ;
}

 Wave computeWave(WaveConfig config, vec3 pos) {
    float alpha = sin((config.dir.x * pos.x + config.dir.y * pos.z) * config.frequency + elapsed_time * config.phase) * 0.5 + 0.5;
    float firstPart = 0.5 * config.sharpness * config.frequency * config.amplitude * pow(alpha, config.sharpness-1);
    float secondPart = cos((config.dir.x * pos.x + config.dir.y * pos.z)*config.frequency + elapsed_time * config.phase);
    float derivativeCommon = firstPart * secondPart;

    float yOffset = config.amplitude * pow(alpha, config.sharpness);
    float xDerivative = derivativeCommon * config.dir.x;
    float zDerivative = derivativeCommon * config.dir.y;
    return Wave(yOffset, xDerivative, zDerivative);
}


