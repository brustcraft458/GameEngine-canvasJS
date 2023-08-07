var dataShader = {}

dataShader['image'] = {
    "vertex": /*glsl*/`
        attribute vec4 a_vertcoord;
        attribute vec2 a_texcoord;
        uniform mat4 u_projection;
        uniform vec2 u_resolution;
        uniform vec3 u_camera;
        uniform vec2 u_texsize;
        uniform vec3 u_position;
        varying vec2 v_texcoord;
        
        mat4 matrixTranslate(mat4 m, vec3 pos) {
            m[3][0] = m[0][0] * pos.x + m[1][0] * pos.y + m[2][0] * pos.z + m[3][0];
            m[3][1] = m[0][1] * pos.x + m[1][1] * pos.y + m[2][1] * pos.z + m[3][1];
            m[3][2] = m[0][2] * pos.x + m[1][2] * pos.y + m[2][2] * pos.z + m[3][2];
            m[3][3] = m[0][3] * pos.x + m[1][3] * pos.y + m[2][3] * pos.z + m[3][3];
            return m;
        }

        mat4 matrixScale(mat4 m, vec2 size) {
            m[0][0] *= size.x;
            m[1][1] *= size.y;
            return m;
        }
        
        vec3 positionCenter(vec3 pos, vec2 size) {
            pos.x = (pos.x - (size.x * 0.5)) + (u_resolution.x * 0.5);
            pos.y = ((pos.y * -1.0) - (size.y * 0.5)) + (u_resolution.y * 0.5);
            return pos;
        }

        void main() {
            mat4 matrix = matrixTranslate(u_projection, positionCenter(u_position + u_camera, u_texsize));
            matrix = matrixScale(matrix, u_texsize);
            gl_Position = matrix * a_vertcoord;
            v_texcoord = a_texcoord;
        }
    `,

    "fragment": /*glsl*/`
        precision mediump float;
        varying vec2 v_texcoord;
        uniform sampler2D u_texture;
        
        void main() {
            vec4 texture = texture2D(u_texture, v_texcoord);
            gl_FragColor = texture;
            gl_FragColor.rgb *= gl_FragColor.a;
        }
    `
}

dataShader['blur'] = {
    "vertex": dataShader.image.vertex,
    "fragment": /*glsl*/`
        precision mediump float;
        varying vec2 v_texcoord;
        uniform sampler2D u_texture;
        uniform highp vec2 u_resolution;

        vec4 boxBlur(sampler2D texture, vec2 texcoord, float blurSize) {
            vec4 blur = vec4(0.0, 0.0, 0.0, 0.0);
            float pixelSize = 1.0 / ((u_resolution.x + u_resolution.y) / 2.0);
            float sumWeight = 0.0;
            float blurWeight = 1.0;
            float stepWeight = blurWeight / 2.0;

            for (float step = -5.0; step <= 5.0; step += 0.5) {
                float stepSize = (step * pixelSize) * blurSize;
                blur += texture2D(texture, texcoord + vec2(stepSize, 0.0)) * stepWeight;
                blur += texture2D(texture, texcoord + vec2(0.0, stepSize)) * stepWeight;
                sumWeight += blurWeight;
            }

            return blur / sumWeight;
        }

        void main() {
            vec4 texture = boxBlur(u_texture, v_texcoord, 5.0);
            gl_FragColor = texture;
            gl_FragColor.rgb *= gl_FragColor.a;
        }
    `
}

export {dataShader}