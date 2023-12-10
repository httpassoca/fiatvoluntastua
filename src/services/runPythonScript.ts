import { exec } from 'child_process';

// Function to call the Python script with additional arguments
export function callPythonScript(path: string, args: string[] = []): Promise<string> {
  return new Promise((resolve, reject) => {
    // Join additional arguments into a string, properly escaping them
    const argsString = args.map(arg => `"${arg.replace(/"/g, '\\"')}"`).join(' ');

    // Construct the command
    const cmd = `python3 ${path} ${argsString}`;

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(`error: ${error.message}`);
        return;
      }
      if (stderr) {
        reject(`stderr: ${stderr}`);
        return;
      }
      resolve(stdout);
    });
  });
}
