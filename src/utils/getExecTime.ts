function getNeo4jExecTime(text: string) {
  const regex = /\|\s+(\d+\.\d+)\s+\|/;
  const lines = text.split("\n");

  for (const line of lines) {
    const match = line.match(regex);
    if (match && match[1]) {
      return parseFloat(match[1]);
    }
  }

  return 0;
}

function getSBExecTime(text: string) {
  // Define the regular expression to match the execution time line
  const regex = /Execution Time:\s+([\d.]+)\s+ms/;

  // Use the regex to search the text
  const match = text.match(regex);

  // If a match is found, return the execution time
  if (match) {
    return parseFloat(match[1]);
  } else {
    // Return null or any appropriate value if no match is found
    return 0;
  }
}

export { getNeo4jExecTime, getSBExecTime };
