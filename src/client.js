import { EntityManager, createCanvas, createGLContext } from "@darkapuch/billy";
import { createRenderPipeline } from "./graphics/render";
import Transform from "./graphics/Transform";
import { loadObj } from "./graphics/model";
import { vec3, quat, mat3, mat4 } from "gl-matrix";

async function preload(gl) {
    const models = {
        map: await loadObj("data/models/map.obj", gl),
        character: await loadObj("data/models/character.obj", gl)
    };
    return models;
}

window.addEventListener("load", () => {
    const canvas = createCanvas(document.body);
    const gl = createGLContext(canvas);
    preload(gl).then((models) => {
        main(canvas, gl, models);
    });
});

function main(canvas, gl, models) {
    const keys = {};
    window.addEventListener("keydown", (event) => keys[event.key.toLowerCase()] = true);
    window.addEventListener("keyup", (event) => delete keys[event.key.toLowerCase()]);

    const em = new EntityManager();

    em.spawn([models.map, new Transform()]);

    const player = em.spawn([models.character, new Transform()]);
    player.get(Transform).move([0, 1.5, 19]);

    const render = createRenderPipeline(em, gl);

    const camera = new Transform();

    function mainloop() {

        const speed = 0.2;
        const dir = vec3.create();

        if (keys.z) vec3.add(dir, dir, player.get(Transform).back());
        if (keys.s) vec3.add(dir, dir, player.get(Transform).forward());
        dir[1] = 0;
        if (keys.q) vec3.add(dir, dir, player.get(Transform).left());
        if (keys.d) vec3.add(dir, dir, player.get(Transform).right());

        if (keys[" "]) vec3.add(dir, dir, [0, 1, 0]);
        if (keys.shift) vec3.add(dir, dir, [0, -1, 0]);

        if (vec3.length(dir) > 1e-5) {
            vec3.normalize(dir, dir);
            vec3.scale(dir, dir, speed);

            player.get(Transform).move(dir);
        }

        const target = vec3.create();
        vec3.add(target, player.get(Transform).position, [0, 10, 10]);
        vec3.lerp(camera.position, camera.position, target, 0.05);

        const lookAtM4 = mat4.create();
        mat4.targetTo(lookAtM4, camera.position, player.get(Transform).position, [0, 1, 0]);
        const lookAtM3 = mat3.create();
        mat3.fromMat4(lookAtM3, lookAtM4);
        const lookAtQuat = quat.create();
        quat.fromMat3(lookAtQuat, lookAtM3);

        camera.rotation = lookAtQuat;

        render(camera);
        requestAnimationFrame(mainloop);
    }
    mainloop();
}
