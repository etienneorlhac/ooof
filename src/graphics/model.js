import parseWFObj from "wavefront-obj-parser";
import expandVertexData from "expand-vertex-data";

export async function loadObj(uri, gl) {
    const content = await fetch(uri).then(response => response.text());
    const data = expandVertexData(parseWFObj(content), { facesToTriangles: true });
    return new Model(gl, data.positions, data.normals, data.positionIndices);
}

export class Model {
    /**
     * @param {WebGLRenderingContext} gl 
     * @param {Number[]} positions 
     * @param {Number[]} normals 
     * @param {Number[]} indices 
     */
    constructor(gl, positions, normals, indices) {
        this.gl = gl;
        this.count = indices.length;
        this.vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        this.nbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.nbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

        this.ibo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    }

    draw(programInfo) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo);
        this.gl.vertexAttribPointer(programInfo.aVertexPosition, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(programInfo.aVertexPosition);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nbo);
        this.gl.vertexAttribPointer(programInfo.aVertexNormal, 3, this.gl.FLOAT, true, 0, 0);
        this.gl.enableVertexAttribArray(programInfo.aVertexNormal);

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.ibo);
        this.gl.drawElements(this.gl.TRIANGLES, this.count, this.gl.UNSIGNED_SHORT, 0);
    }
}
