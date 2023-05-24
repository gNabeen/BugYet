// install /Backend and /Frontend dependencies

const { spawn } = require('child_process');

const backend = spawn('npm', ['install'], {
    cwd: './Backend',
    shell: true,
    stdio: 'inherit'
});

const frontend_legacy = spawn('npm', ['config', 'set', 'legacy-peer-deps', 'true'], {
    cwd: './Frontend',
    shell: true,
    stdio: 'inherit'
});

const frontend = spawn('npm', ['install'], {
    cwd: './Frontend',
    shell: true,
    stdio: 'inherit'
});



process.on('SIGINT', () => {
    backend.kill('SIGINT');
    frontend_legacy.kill('SIGINT');
    frontend.kill('SIGINT');
    process.exit();
});
