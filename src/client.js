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
    player.get(Transform).move([0, 7, 19]);

    const render = createRenderPipeline(em, gl);

    const camera = new Transform();

    const momentum = vec3.create();
    const accel = 0.1
    const decel = 0.2;
    const maxSpeed = 0.2;
    const walkMultiplier = 0.5;

    function mainloop() {
        let dir = vec3.create();

        if (keys.z) vec3.add(dir, dir, [0, 0, -1]);
        if (keys.s) vec3.add(dir, dir, [0, 0, 1]);
        if (keys.q) vec3.add(dir, dir, [-1, 0, 0]);
        if (keys.d) vec3.add(dir, dir, [1, 0, 0]);

        vec3.normalize(dir, dir);

        if (keys.shift) {
            vec3.scale(dir, dir, maxSpeed * walkMultiplier);
        } else {
            vec3.scale(dir, dir, maxSpeed);
        }

        if (vec3.length(dir) > vec3.length(momentum)) {
            vec3.lerp(momentum, momentum, dir, accel);
        } else {
            vec3.lerp(momentum, momentum, dir, decel);
        }

        player.get(Transform).move(momentum);

        if (vec3.length(dir) > 1e-5) {
            const t = new Transform();
            const characterTarget = vec3.create();
            vec3.add(characterTarget, player.get(Transform).position, momentum);
            t.lookAt(player.get(Transform).position, characterTarget);

            quat.slerp(player.get(Transform).rotation, player.get(Transform).rotation, t.rotation, 0.2);
        }

        const target = vec3.create();
        vec3.add(target, player.get(Transform).position, [0, 25, 25]);
        vec3.lerp(camera.position, camera.position, target, 1);

        camera.lookAt(camera.position, player.get(Transform).position);

        const light = player.get(Transform).position;

        render(camera, light);
        requestAnimationFrame(mainloop);
    }
    mainloop();
}
