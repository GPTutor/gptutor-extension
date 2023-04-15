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
} from "vscode";
// const path = require('path');
import { getApiKey } from "./apiKey";
import { openAiIsActive } from "./openAi";
import { CursorContext } from "./context/cursor.context";
import { GPTutor } from "./gptutor";
import { getModel } from "./model";

// import { TextDocuments } from "vscode-languageserver";
// import { TextDocument } from "vscode-languageserver-textdocument";
// const documents = new TextDocuments(TextDocument);

export function activate(context: ExtensionContext) {
  const gptutor = new GPTutor(context);

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
    languages.registerHoverProvider(["solidity", "javascript", "python"], {
      provideHover(document, position, token) {
        // const fileName = document.fileName;
        // const workDir = path.dirname(fileName);

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
        const activeCommandUri = Uri.parse(`command:Active GPTutor`);
        const auditCommandUri = Uri.parse(`command:Audit GPTutor`);
        const command = new MarkdownString(
          `[🤖 GPTutor](${activeCommandUri}) &nbsp;&nbsp; [🕵️ Audit](${auditCommandUri})`
        );
        command.isTrusted = true;
        return new Hover([codeBlockContent, command]);
      },
    })
  );
  context.subscriptions.push(
    commands.registerCommand("Active GPTutor", async () => {
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
          codeContext: auditContext,
          selectedCode: cursorContext.currentText,
        },
        "Audit"
      );
    })
  );

  // context.subscriptions.push(
  //   commands.registerCommand("Active GPTutor", async () => {
  //     let OPEN_AI_API_KEY: any = context.globalState.get("OpenAI_API_KEY");
  //     let MODEL: any = context.globalState.get("MODEL");
  //     if (!(await openAiIsActive(OPEN_AI_API_KEY))) {
  //       await getApiKey(context);
  //     }
  //     const editor: any = window.activeTextEditor;
  //     if (!editor) {
  //       window.showErrorMessage("No active editor");
  //       return;
  //     }

  //     const { explainContext, languageId } = await getCurrentPromptV2(
  //       cursorContext
  //     );
  //     await showAnswer(OPEN_AI_API_KEY, MODEL, {
  //       question: cursorContext.currentText,
  //       code_context: explainContext,
  //       program_language: languageId,
  //     });

  //     // const { question, codeContext, definitionContextPrompt } = await getCurrentPrompt(cursorContext);

  //     // await showAnswer(OPEN_AI_API_KEY, {
  //     //   question,
  //     //   code_context: codeContext,
  //     //   program_language: editor.document.languageId,
  //     //   definitionContextPrompt,
  //     // });
  //   })
  // );

  cursorContext.init();
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
