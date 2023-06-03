/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import {
  window,
  commands,
  ExtensionContext,
  Uri,
  languages,
  Hover,
  MarkdownString,
  workspace,
} from "vscode";
import * as vscode from "vscode";
// const path = require('path');
import { getApiKey } from "./apiKey";
import { openAiIsActive } from "./openAi";
import { CursorContext } from "./context/cursor.context";
import { GPTutor } from "./gptutor";
import { getModel } from "./model";
import * as fs from "fs";

// import { TextDocuments } from "vscode-languageserver";
// import { TextDocument } from "vscode-languageserver-textdocument";
// const documents = new TextDocuments(TextDocument);

function initConfig(context: ExtensionContext) {
  let src = context.workspaceState.get("src");
  let configPath =
    context.extensionPath + "/" + src + "/media/prompt_config.json";
  if (!fs.existsSync(configPath)) {
    fs.copyFileSync(
      configPath.replace("prompt_config.json", "example_prompt_config.json"),
      configPath
    );
  }
  context.subscriptions.push(
    commands.registerCommand("GPTutor Edit Prompts", async () => {
      vscode.workspace
        .openTextDocument(configPath)
        .then((doc) => window.showTextDocument(doc));
    })
  );
  context.subscriptions.push(
    commands.registerCommand("GPTutor Reset Prompts Config", async () => {
      vscode.workspace
        .openTextDocument(configPath)
        .then((doc) => window.showTextDocument(doc));
    })
  );
}

export function activate(context: ExtensionContext) {
  let src =
    vscode.ExtensionMode[context.extensionMode] === "Development"
      ? "src"
      : "out";
  context.workspaceState.update("src", src);
  const gptutor = new GPTutor(context);
  initConfig(context);

  const cursorContext = new CursorContext(context);

  console.log(
    'Congratulations, your extension "gptutor-extension" is now active!'
  );
  let disposable = commands.registerCommand(
    "gptutor-extension.helloWorld",
    () => {
      window.showInformationMessage("Hello World from gptutor-extension!");
    }
  );

  gptutor.registerVscode();
  context.subscriptions.push(disposable);

  // Initialize GPTutor
  context.subscriptions.push(
    commands.registerCommand("Initialize GPTutor", async () => {
      let OPEN_AI_API_KEY: any = context.globalState.get("OpenAI_API_KEY");
      gptutor.setOpenAiKey(OPEN_AI_API_KEY);
      if (await openAiIsActive(OPEN_AI_API_KEY)) {
        window.showInformationMessage(`GPTutor Activate Successfully!`);
      } else {
        await getApiKey(context);
      }
    })
  );

  // Set OpenAI API key
  context.subscriptions.push(
    commands.registerCommand("Set OpenAI API Key", async () => {
      await getApiKey(context);
    })
  );

  context.subscriptions.push(
    commands.registerCommand("Set Model", async () => {
      await getModel(context);
    })
  );

  // show Hover provider when hovering over code
  // determine if cursor is selected Text or Hovering over some code
  context.subscriptions.push(
    languages.registerHoverProvider(
      [
        "dockercompose",
        "jsonc",
        "javascriptreact",
        "solidity",
        "json",
        "tex",
        "git-commit and git-rebase",
        "abap",
        "lua",
        "vb",
        "vue",
        "groovy",
        "yaml",
        "java",
        "css",
        "haml",
        "go",
        "stylus",
        "typescript",
        "typescriptreact",
        "less",
        "fsharp",
        "cpp",
        "python",
        "clojure",
        "xsl",
        "powershell",
        "rust",
        "ini",
        "perl and perl6",
        "r",
        "javascript",
        "handlebars",
        "ruby",
        "slim",
        "coffeescript",
        "shellscript",
        "swift",
        "csharp",
        "makefile",
        "markdown",
        "bibtex",
        "jade, pug",
        "scss (syntax using curly brackets), sass (indented syntax)",
        "move",
        "razor",
        "dockerfile",
        "html",
        "c",
        "bat",
        "cuda-cpp",
        "objective-c",
        "plaintext",
        "xml",
        "php",
        "vue-html",
        "diff",
        "sql",
        "latex",
        "objective-cpp",
        "shaderlab",
      ],
      {
        provideHover(document, position, token) {
          if (!gptutor.isInited) {
            return new Hover([]);
          }

          const editor = window.activeTextEditor;
          if (!editor) {
            window.showErrorMessage("No active editor");
            return;
          }
          const codeBlockContent = new MarkdownString();
          codeBlockContent.appendCodeblock(`/** GPTutor (🤖,🤖) */`);
          codeBlockContent.appendCodeblock(
            cursorContext.currentText,
            document.languageId
          );
          const activeCommandUri = Uri.parse(`command:GPTutor Explain`);
          const commentCommandUri = Uri.parse(`command:GPTutor Comment`);
          const auditCommandUri = Uri.parse(`command:Audit GPTutor`);

          const command = new MarkdownString(
            `[🧑‍🏫 Explain](${activeCommandUri})&nbsp; [📝 Comment](${commentCommandUri})&nbsp; [🕵️ Audit](${auditCommandUri})&nbsp; By GPTutor`
          );
          command.isTrusted = true;
          return new Hover([command]);
        },
      }
    )
  );

  context.subscriptions.push(
    commands.registerCommand("GPTutor Comment", async () => {
      const { auditContext, languageId } = await getCurrentPromptV2(
        cursorContext
      );
      gptutor.search(
        {
          languageId: languageId,
          auditContext,
          selectedCode: cursorContext.currentText,
        },
        "Comment"
      );
    })
  );
  context.subscriptions.push(
    commands.registerCommand("GPTutor Explain", async () => {
      const { explainContext, languageId } = await getCurrentPromptV2(
        cursorContext
      );
      gptutor.search(
        {
          languageId: languageId,
          codeContext: explainContext,
          selectedCode: cursorContext.currentText,
        },
        "Explain"
      );
    })
  );

  context.subscriptions.push(
    commands.registerCommand("Audit GPTutor", async () => {
      const { auditContext, languageId } = await getCurrentPromptV2(
        cursorContext
      );

      gptutor.search(
        {
          languageId: languageId,
          auditContext,
          selectedCode: cursorContext.currentText,
        },
        "Audit"
      );
    })
  );
  commands.executeCommand("Initialize GPTutor");
  // cursorContext.init();
}

async function getCurrentPromptV2(cursorContext: CursorContext) {
  const editor = window.activeTextEditor;
  if (!editor) {
    window.showErrorMessage("No active editor");
    throw new Error("No active editor");
  }

  const document = editor.document;
  const languageId = document.languageId;

  const currentTextLines = document.getText().split("\n");
  const anchorPosition: any = cursorContext.anchorPosition;

  const explainContext = currentTextLines
    .slice(anchorPosition.c - 300, anchorPosition.c + 300)
    .join("\n");

  const auditContext = currentTextLines
    .slice(0, currentTextLines.length)
    .join("\n");

  // const definitionContext = await cursorContext.getDefinitionContext();
  // const definitionContextPrompt = `The following is the source code of the line ${currentTextLines[anchorPosition.c]}:\n${definitionContext}`;
  return { languageId, auditContext, explainContext };
}

// origin
async function getCurrentPrompt(cursorContext: CursorContext) {
  const editor: any = window.activeTextEditor;
  if (!editor) {
    window.showErrorMessage("No active editor");
    throw new Error("No active editor");
  }

  const document = editor.document;
  const languageId = document.languageId;

  const currentTextLines = document.getText().split("\n");
  const anchorPosition: any = cursorContext.anchorPosition;
  // const currentLine = currentTextLines[cursorContext.anchorPosition?.c];
  const question = `Question: why use ${cursorContext.currentText} at ${
    currentTextLines[anchorPosition.c]
  } in the ${document.languageId} code above?`;
  const codeContext = currentTextLines
    .slice(anchorPosition.c - 15, anchorPosition.c + 15)
    .join("\n");

  const definitionContext = await cursorContext.getDefinitionContext();
  const definitionContextPrompt = `The following is the source code of the line ${
    currentTextLines[anchorPosition.c]
  }:\n${definitionContext}`;
  return { languageId, question, codeContext, definitionContextPrompt };
}

export function deactivate() {}
