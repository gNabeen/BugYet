const { spawn } = require('child_process');

// const backend = spawn('node', ['index.js'], {
//     cwd: './Backend',
//     shell: true,
//     stdio: 'inherit'
// });

const frontend = spawn('npm', ['start'], {
    cwd: './Frontend',
    shell: true,
    stdio: 'inherit'
});

process.on('SIGINT', () => {
    // backend.kill('SIGINT');
    frontend.kill('SIGINT');
    process.exit();
});
