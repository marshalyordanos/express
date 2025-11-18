// src/main.container.ts
import { exec } from 'child_process';

exec('npm run start:prod', (err, stdout, stderr) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(stdout);
  console.error(stderr);
});
