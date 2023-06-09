/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import {
  window,
  commands,
  ExtensionContext,
  env,
  Uri,
  ProgressLocation,
  languages,
} from "vscode";
import * as vscode from "vscode";
import { Configuration, OpenAIApi, CreateChatCompletionRequest } from "openai";

// import { TextDocuments } from "vscode-languageserver";
// import { TextDocument } from "vscode-languageserver-textdocument";
// const documents = new TextDocuments(TextDocument);

function getOpenAI(apiKey: string | undefined) {
  const configuration = new Configuration({
    // organization: "org-VNRWJBIZ9qvXzs7kstQrqF71",
    apiKey: apiKey,
  });
  const openai = new OpenAIApi(configuration);

  return openai;
}

function sleep(second: number) {
  return new Promise((resolve) => setTimeout(resolve, second * 1000));
}

async function validApiKey(apiKey: string | undefined) {
  let openai: OpenAIApi = getOpenAI(apiKey);
  console.log(openai);
  try {
    const response = await openai.listModels();
    return true;
  } catch (e: any) {
    if (e.message === "Request failed with status code 401") {
      return false;
    } else {
      throw e;
    }
  }
}

async function inputOpenAiKey(context: ExtensionContext, invalidKey = false) {
  const result = await window.showInputBox({
    title: context.workspaceState.get("invalidKey", false)
      ? "Invalid OpenAI API Key, Try again."
      : "Input Your OpenAI API Key",
    value: "",
    placeHolder: "Paste your OpenAI API Key here",
  });
  if (await validApiKey(result)) {
    // context.globalState.update("OpenAI_API_KEY", result);
    vscode.workspace
      .getConfiguration("gptutor")
      .update("openAIApiKey", result, vscode.ConfigurationTarget.Global);
    let OPENAI_API_KEY = vscode.workspace
      .getConfiguration("gptutor")
      .get("openAIApiKey");
    context.workspaceState.update("invalidKey", NaN);
    window.showInformationMessage(`OpenAI_API_KEY Add Success!`);
  } else {
    window.showErrorMessage("Invalid OpenAI API Key!");
    context.workspaceState.update("invalidKey", true);
    obtainApiKey(context);
    return;
  }
}
async function showTutorial() {
  env.openExternal(Uri.parse("https://www.stackoverflow.com/"));
}

export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand("tutor.init", async () => {
      let OPENAI_API_KEY: any = vscode.workspace
        .getConfiguration("gptutor")
        .get("openAIApiKey");
      if (await validApiKey(OPENAI_API_KEY)) {
        window.showInformationMessage(`Code Tutor Activate Successfully!`);
      } else {
        await obtainApiKey(context);
      }
    })
  );
  context.subscriptions.push(
    commands.registerCommand("tutor.updateKey", async () => {
      await obtainApiKey(context);
    })
  );
  context.subscriptions.push(
    commands.registerCommand("tutor.test", async () => {
      // await sleep(0.1);
      // commands.executeCommand("workbench.action.navigateBack");
      let text = `${"a"}\n
        The following is the ${"b"} code: ${"c"}\n
        ${"d"}`;
      console.log(text);
    })
  );
  context.subscriptions.push(
    commands.registerCommand("tutor.explainCode", async () => {
      // window.showInformationMessage(`Tutor is answering, please wait...`);
      window.withProgress(
        {
          location: ProgressLocation.Notification,
          title: "Finding ...",
          cancellable: false,
        },
        async (progress, token) => {
          for (let i = 0; i < 1000; i++) {
            setTimeout(() => {
              progress.report({
                increment: i * 10,
                message: "Tutor is answering, please wait...",
              });
            }, 100000);
          }
        }
      );
      const editor: any = window.activeTextEditor;
      const position = editor.selection.active;
      let document = editor.document;
      let currentTextLines: any = document
        .getText()
        // .replaceAll("  ", "")
        .split("\n");
      let question;
      if (editor.selection.isEmpty) {
        question = `Question: why ${currentTextLines[position.c]} in the ${
          editor.document.languageId
        } code above?`;
      } else {
        const selectedText = editor?.document.getText(editor.selection);
        question = `Question: why use ${selectedText} at ${
          currentTextLines[position.c]
        } in the ${editor.document.languageId} code above?`;
      }

      // console.log(position);

      let codeContext = currentTextLines
        .slice(position.c - 50, position.c + 50)
        .join("\n");
      let definitionContext = await getDefinitionContext();
      let definitionContextPrompt = `The following is the source code of the library of ${definitionContext}:\n${definitionContext}`;

      let OPENAI_API_KEY: any = vscode.workspace
        .getConfiguration("gptutor")
        .get("openAIApiKey");
      let openai: OpenAIApi = getOpenAI(OPENAI_API_KEY);
      let request: any = {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a helpful coding tutor master in ${editor.document.languageId}.`,
          },
          {
            role: "user",
            content: `${definitionContextPrompt}\n\nThe following is the ${editor.document.languageId} code:\n${codeContext}\n\n${question}`,
          },
        ],
      };
      let language,
        selectedFunctionName,
        sourceCodeOfSelectedFunction,
        selectedText,
        textAtLineOfCursor;

      let res = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a helpful coding tutor master in ${editor.document.languageId}.`,
          },
          {
            role: "user",
            content: `The following is the source code of the library of 
  ${selectedFunctionName}:\n${sourceCodeOfSelectedFunction}\n
  The following is the ${language} code:\n${codeContext}\n
  Question: why use ${selectedText} at ${textAtLineOfCursor}
  in the ${language} code above?`,
          },
        ],
      });
      let explain = res.data.choices[0].message?.content;

      console.log(explain, res.data.usage?.total_tokens);

      let channel = window.createOutputChannel("AI Tutor");
      channel.append(`${res.data.choices[0].message?.content}`);
      window.showInformationMessage(`${res.data.choices[0].message?.content}`);
      // TODO: GPT-3 Tokenizer is same as GPT-2, try use GPT2 Tokenizer to estimated the price.
    })
  );
}

async function obtainApiKey(context: ExtensionContext) {
  const options: {
    [key: string]: (context: ExtensionContext) => Promise<void>;
  } = {
    "I already have an OpenAI API key": inputOpenAiKey,
    "How to get an API key? (Tutorial)": showTutorial,
  };
  const quickPick = window.createQuickPick();
  quickPick.items = Object.keys(options).map((label) => ({ label }));
  quickPick.onDidChangeSelection((selection) => {
    if (selection[0]) {
      options[selection[0].label](context).catch(console.error);
    }
  });
  quickPick.onDidHide(() => quickPick.dispose());
  quickPick.show();
}

async function getDefinitionContext() {
  let channel = window.createOutputChannel("getDefinitionContext");
  let editor: any = window.activeTextEditor;
  let activeFsPath = editor.document.uri.fsPath;
  channel.appendLine("activeFsPath" + activeFsPath);
  const activePosition = editor.selection.active;
  // editor.action.revealDefinition();
  await commands.executeCommand("editor.action.revealDefinition");
  editor = window.activeTextEditor;
  if (
    activeFsPath === editor.document.uri.fsPath &&
    activePosition === editor.selection.active
  ) {
    channel.appendLine("return NaN;");
    return NaN;
  }

  const position = editor.selection.active;
  let document = editor.document;
  let currentTextLines: any = document
    .getText()
    // .replaceAll("  ", "")
    .split("\n");
  let definitionContext = currentTextLines
    .slice(position.c - 50, position.c + 50)
    .join("\n");
  channel.appendLine(
    "window.activeTextEditor?.document.uri.fsPath" +
      window.activeTextEditor?.document.uri.fsPath
  );
  if (window.activeTextEditor?.document.uri.fsPath !== activeFsPath) {
    await commands.executeCommand("workbench.action.closeActiveEditor");
  }
  return definitionContext;
}
