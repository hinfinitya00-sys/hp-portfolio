import fs from 'node:fs';
import validator from 'gltf-validator';
const report=await validator.validateBytes(new Uint8Array(fs.readFileSync(new URL('../assets/models/tsubasa-terrain.glb',import.meta.url))),{uri:'tsubasa-terrain.glb'});
console.log(JSON.stringify(report.issues,null,2));if(report.issues.numErrors)process.exitCode=1;
