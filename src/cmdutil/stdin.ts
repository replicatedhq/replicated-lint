export function readFromStdin(): Promise<string> {
  process.stdin.resume();
  process.stdin.setEncoding("utf8");

  let data = "";

  process.stdin.on("data", (chunk) => {
    data += chunk;
  });

  return new Promise<string>((resolve) => {
    process.stdin.on("end", () => {
      resolve(data);
    });
  });
}
