import { watch } from "rollup";
import config from "../rollup.config.js";
import livereload from "livereload";
import signale from "signale";
import express from "express";

const watcher = watch(config);

watcher.on('event', event => {
    if (event.code === "BUNDLE_START") {
        signale.info(`Recompiling ${event.input} ...`);
    }
    if (event.code === "BUNDLE_END") {
        signale.success(`Done ! ${event.duration}ms`)
    }
    if (event.code === "ERROR") {
        signale.error(event.error);
    }
    if (event.code === "FATAL") {
        signale.fatal(`${event.error.loc.file}:${event.error.loc.line}`);
        signale.fatal(event.error);
        process.exit(1);
    }
});

const lrserver = livereload.createServer();
lrserver.watch("./public/dist");

const fileserver = express();
fileserver.get("/", (req, res) => {
    res.send(
        `<script src="${config.output.file.replace("public/", "")}"></script>
<script>
    // LIVERELOAD CLIENT DO NOT REMOVE
    document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] +
    ':35729/livereload.js?snipver=1"></' + 'script>')
</script> 
`)
});
fileserver.use(express.static("public"));
fileserver.listen(8080, () => signale.warn("Go to http://localhost:8080 :)"));
