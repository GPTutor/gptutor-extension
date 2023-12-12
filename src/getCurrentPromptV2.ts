import { window } from "vscode";
import * as vscode from "vscode";
import { CursorContext } from "./context/cursor.context";

// let commands = require("./sui_move_analyzer_commands");

export async function getCurrentPromptV2(
  extensionContext: any,
  cursorContext: CursorContext
) {
  const editor = window.activeTextEditor;

  if (!editor) {
    window.showErrorMessage("No active editor");
    throw new Error("No active editor");
  }

  const document = editor.document;
  const languageId = document.languageId;
  // Check if the languageId is "move"
  if (languageId == "move") {
    // Import the move_analyzer_context module
    const move_analyzer_context_1 = await import("./move_analyzer_context.js");
    // Define the configuration object for move_analyzer_context
    const configuration = {
      server: { path: "/Users/eason/.cargo/bin/move-analyzer" },
      serverPath: "/Users/eason/.cargo/bin/move-analyzer",
      inlay: {
        hints: {
          parameter: true,
          field: { type: true },
          declare: { var: true },
        },
      },
      trace: { server: "off" },
    };
    // Create an instance of move_analyzer_context with the provided extensionContext and configuration
    const move_analyzer_context: any = move_analyzer_context_1.Context.create(
      extensionContext,
      configuration
    );
    // Start the client for move_analyzer_context
    await move_analyzer_context.startClient();
    const client = move_analyzer_context.getClient();

    // If the client is undefined, return undefined
    if (client === undefined) {
      return undefined;
    }

    // Send a request for inlay hints using the client
    const hints = await client.sendRequest("textDocument/inlayHint", {
      range: [
        { line: 0, character: 0 },
        { line: document.lineCount, character: 0 },
      ],
      textDocument: { uri: document.uri.toString() },
    });

    // Log the line count and the first hint
    console.log(document.lineCount, hints[0]);

    const text = document.getText();
    let lines = text.split("\n");
    console.log(hints);
    let linesPrePadding = Object();

    // Iterate through the hints
    for (let i = 0; i < hints.length; i++) {
      const hint = hints[i];
      if (hint.kind === 2) {
        let line = lines[hint.position.line];
        if (hint.position.character <= line.length) {
          // Insert the hint value at the specified position in the line
          if (!linesPrePadding[hint.position.line]) {
            linesPrePadding[hint.position.line] = 0;
          }

          const newLine =
            line.substring(
              0,
              hint.position.character + linesPrePadding[hint.position.line]
            ) +
            hint.label[0].value +
            " " +
            line.substring(
              hint.position.character + linesPrePadding[hint.position.line]
            );
          lines[hint.position.line] = newLine;
          linesPrePadding[hint.position.line] += hint.label[0].value.length + 1;
        } else {
          console.error("Invalid character position");
        }
      }
    }
    console.log(lines.join("\n"));
  }

  const currentTextLines = document.getText().split("\n");
  const anchorPosition: any = cursorContext.anchorPosition;

  const codeContext = currentTextLines
    .slice(anchorPosition.c - 300, anchorPosition.c + 300)
    .join("\n");

  const codeBefore = currentTextLines.slice(0, anchorPosition.c).join("\n");
  const codeAfter = currentTextLines
    .slice(anchorPosition.c, currentTextLines.length)
    .join("\n");
  const codeContextBefore = currentTextLines
    .slice(anchorPosition.c - 100, anchorPosition.c)
    .join("\n");
  const codeContextAfter = currentTextLines
    .slice(anchorPosition.c, anchorPosition.c + 100)
    .join("\n");

  const entireDocument = currentTextLines
    .slice(0, currentTextLines.length)
    .join("\n");
  let selectedCode = cursorContext.currentText;

  // const definitionContext = await cursorContext.getDefinitionContext();
  let definitionContext = "";
  // const definitionContextPrompt = `The following is the source code of the line ${currentTextLines[anchorPosition.c]}:\n${definitionContext}`;
  return {
    languageId,
    entireDocument,
    codeContext,
    definitionContext,
    selectedCode,
    codeBefore,
    codeAfter,
    codeContextBefore,
    codeContextAfter,
  };
}
