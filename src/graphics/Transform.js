import { vec3, quat, mat4, mat3 } from "gl-matrix";

export default
    class Transform {

    constructor() {
        /**
         * @type {Transform}
         */
        this.parent = null;

        /**
         * @type {vec3}
         */
        this.position = [0, 0, 0];

        /**
         * @type {quat}
         */
        this.rotation = quat.create();

        /**
         * @type {vec3}
         */
        this.scale = [1, 1, 1];
    }

    /**
     * @returns {mat4}
     */
    getMatrix() {
        const matrix = mat4.create();
        mat4.fromRotationTranslationScale(matrix, this.rotation, this.position, this.scale);
        if (this.parent) {
            return mat4.mul(matrix, this.parent.getMatrix(), matrix);
        }
        return matrix;
    }

    getViewMatrix() {
        const matrix = this.getMatrix();
        return mat4.invert(matrix, matrix);
    }

    getRotationMatrix() {
        const matrix = mat3.create();
        return mat3.fromQuat(matrix, this.rotation);
    }

    /**
     * @param {vec3} offset 
     */
    move(offset) {
        vec3.add(this.position, this.position, offset);
    }

    /**
     * @param {vec3} axis 
     * @param {Number} angle 
     */
    rotate(axis, angle) {
        const rot = quat.create();
        quat.setAxisAngle(rot, axis, angle);
        quat.mul(this.rotation, rot, this.rotation);
        quat.normalize(this.rotation, this.rotation);
    }

    forward() {
        const axis = [0, 0, 1];
        return vec3.transformQuat(axis, axis, this.rotation);
    }

    back() {
        const axis = [0, 0, -1];
        return vec3.transformQuat(axis, axis, this.rotation);
    }

    right() {
        const axis = [1, 0, 0];
        return vec3.transformQuat(axis, axis, this.rotation);
    }

    left() {
        const axis = [-1, 0, 0];
        return vec3.transformQuat(axis, axis, this.rotation);
    }

    up() {
        const axis = [0, 1, 0];
        return vec3.transformQuat(axis, axis, this.rotation);
    }

    down() {
        const axis = [0, -1, 0];
        return vec3.transformQuat(axis, axis, this.rotation);
    }

    /**
     * @returns {Transform}
     */
    copy() {
        const t = new Transform();
        t.position = vec3.clone(this.position);
        t.rotation = quat.clone(this.rotation);
        t.scale = vec3.clone(this.scale);
        return t;
    }
}
Transform.X = [1, 0, 0];
Transform.Y = [0, 1, 0];
Transform.Z = [0, 0, 1];
