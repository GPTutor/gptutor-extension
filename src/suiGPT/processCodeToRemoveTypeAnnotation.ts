export function processCodeToRemoveTypeAnnotation(code: string): string {
  let inFunctionDefinition = false;
  let processedLines: string[] = [];

  code.split("\n").forEach((line) => {
    // Check if entering function definition
    if (line.includes("fun")) {
      inFunctionDefinition = true;
    }

    // If not in function definition, process the line
    if (!inFunctionDefinition) {
      // Only remove the colon followed by spaces (for type annotations)
      line = line.replace(/\w+\s*:\s/g, "");
    }

    // Check if leaving function definition
    if (inFunctionDefinition && line.includes(")")) {
      inFunctionDefinition = false;
    }

    processedLines.push(line);
  });

  return processedLines.join("\n");
}
