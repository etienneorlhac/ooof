import { EntityManager } from "@darkapuch/billy";
import { initShaderProgram } from "./shader";
import { mat4 } from "gl-matrix";
import Transform from "./Transform";
import { Model } from "./model";

const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexNormal;

    uniform mat4 uModelMatrix;
    uniform mat4 uViewMatrix;
    uniform mat4 uProjectionMatrix;
    uniform mat3 uNormalMatrix;

    varying vec3 pos;
    varying vec3 normal;

    void main() {
        pos = (uModelMatrix * aVertexPosition).xyz;
        normal = (uNormalMatrix * aVertexNormal.xyz);
        gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * aVertexPosition;
    }
`;

const fsSource = `
    uniform lowp vec3 lightPos;

    varying lowp vec3 pos;
    varying lowp vec3 normal;

    void main() {
        lowp vec3 offset = vec3(0.0,3.0,0.0);
        lowp vec3 toLight = lightPos + offset - pos;
        lowp float mdist = distance(pos, lightPos + offset)/50.0;
        lowp float falloff = max(0.0,1.0-(mdist*mdist));
        gl_FragColor = vec4(vec3(dot(normal, normalize(toLight))*falloff), 1.0);
    }
`;

/**
 * @param {EntityManager} em 
 * @param {WebGLRenderingContext} gl
 * @returns {()=>void}
 */
export function createRenderPipeline(em, gl) {

    gl.clearColor(0.1, 0.1, 0.1, 1);

    const program = initShaderProgram(gl, vsSource, fsSource);

    const programInfo = {
        aVertexPosition: gl.getAttribLocation(program, 'aVertexPosition'),
        aVertexNormal: gl.getAttribLocation(program, 'aVertexNormal'),
        uProjectionMatrix: gl.getUniformLocation(program, 'uProjectionMatrix'),
        uModelMatrix: gl.getUniformLocation(program, 'uModelMatrix'),
        uViewMatrix: gl.getUniformLocation(program, 'uViewMatrix'),
        uNormalMatrix: gl.getUniformLocation(program, 'uNormalMatrix'),
        lightPos: gl.getUniformLocation(program, 'lightPos')
    };

    function fixPerspective() {
        const fieldOfView = 90 * Math.PI / 180 * gl.canvas.height / gl.canvas.width;   // in radians
        const aspect = gl.canvas.width / gl.canvas.height;
        const zNear = 0.1;
        const zFar = 1000.0;
        const projectionMatrix = mat4.create();

        // note: glmatrix.js always has the first argument
        // as the destination to receive the result.
        mat4.perspective(projectionMatrix,
            fieldOfView,
            aspect,
            zNear,
            zFar);

        gl.uniformMatrix4fv(
            programInfo.uProjectionMatrix,
            false,
            projectionMatrix);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    }

    window.addEventListener("resize", fixPerspective);
    gl.useProgram(program);
    fixPerspective();

    return function (camera, light) {
        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT, gl.DEPTH_BUFFER_BIT);

        gl.useProgram(program);

        gl.uniformMatrix4fv(
            programInfo.uViewMatrix,
            false,
            camera.getViewMatrix());

        em.query([Model, Transform]).forEach(e => {
            gl.uniformMatrix4fv(
                programInfo.uModelMatrix,
                false,
                e.get(Transform).getMatrix());
            gl.uniformMatrix3fv(
                programInfo.uNormalMatrix,
                false,
                e.get(Transform).getRotationMatrix());
            gl.uniform3fv(programInfo.lightPos, light);
            e.get(Model).draw(programInfo);
        });
    }
}
