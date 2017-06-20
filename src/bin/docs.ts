import { rules } from "../";
import * as pad from "pad";

const col1 = 52;
const col2 = 5;
const col3 = 150;

// generate markdown table
export function printTable() {
  const header = {
    name: "Name",
    type: "Type",
    message: "Message",
  };

  console.log(`${pad(header.name, col1)} | ${pad(header.type, col2)} | ${pad(header.message, col3)} |`);
  console.log(`${"-".repeat(col1)}-|-${"-".repeat(col2)}-|-${"-".repeat(col3)} |`);

  rules.all.forEach(r => {
    console.log(`${pad("`" + r.name + "`", col1)} | ${pad(r.type, col2)} | ${pad(r.message, col3)} |`);
  });
}

printTable();
