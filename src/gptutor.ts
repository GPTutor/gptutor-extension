import { OpenAIApi } from "openai";
import * as vscode from "vscode";
import { DefaultOpenAiModel, GPTutorOpenAiProvider } from "./openAi";
import {
  GPTutorPromptType,
  getExplainRequestMsg,
  FirstAuditRequest,
  getAuditRequestMsg,
  FirstReplyForGpt3,
} from "./prompt";

export class GPTutor implements vscode.WebviewViewProvider {
  public static readonly viewType = "gptutor.chatView";

  private openAiProvider!: GPTutorOpenAiProvider;
  private view?: vscode.WebviewView;

  private context!: vscode.ExtensionContext;
  private currentResponse: string = "";
  private currentMessageNum = 0;
  private currentPrompt?: GPTutorPromptType;
  public isInited = false;

  constructor(_context: vscode.ExtensionContext) {
    this.context = _context;
    let channel = vscode.window.createOutputChannel("GPTutor");
    this.context.workspaceState.update("channel", channel);
    this.appendOutput("GPTutor is constructed.");
  }

  appendOutput(text: string) {
    let channel: any = this.context.workspaceState.get("channel");
    channel.appendLine(text);
    channel.show(true);
    return true;
  }

  async registerVscode() {
    this.context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(GPTutor.viewType, this, {
        webviewOptions: { retainContextWhenHidden: true },
      })
    );

    await vscode.commands.executeCommand(`${GPTutor.viewType}.focus`);
  }

  setOpenAiKey(key: string) {
    this.openAiProvider = new GPTutorOpenAiProvider();
    this.openAiProvider.setApiKey(key);
    this.isInited = true;
  }

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this.view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.context.extensionUri],
    };
    webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);
    this.view.webview.onDidReceiveMessage((message) => {
      switch (message.command) {
        case "alert":
          vscode.window.showErrorMessage(message.text);
          return;
        case "log":
          vscode.window.showInformationMessage(message.text);
          return;
      }
    }, undefined);
  }
  updateViewContent(new_text: string, total_text_so_far: string, options: any) {
    options.view.webview.postMessage({
      type: "gptutor-set-answer",
      value: total_text_so_far,
    });
  }

  public async search(prompt: GPTutorPromptType, type: string) {
    this.currentPrompt = prompt;
    const model =
      (this.context.globalState.get("MODEL") as string) || DefaultOpenAiModel;

    if (!prompt) {
      return;
    }

    // focus gpt activity from activity bar
    if (!this.view) {
      await vscode.commands.executeCommand(`${GPTutor.viewType}.focus`);
    } else {
      this.view?.show?.(true);
    }

    this.currentResponse = "Loading......";

    this.view?.webview.postMessage({
      type: "gptutor-set-prompt",
      value: this.currentPrompt?.selectedCode || "",
    });
    this.view?.webview.postMessage({
      type: "gptutor-set-answer",
      value: this.currentResponse,
    });

    this.currentMessageNum++;

    try {
      let currentMessageNumber = this.currentMessageNum;
      switch (type) {
        case "Explain":
          const explainSearchPrompt = getExplainRequestMsg(
            prompt.languageId,
            prompt.codeContext || "",
            prompt.selectedCode
          );
          let completion: any = await this.openAiProvider.ask(
            model,
            explainSearchPrompt,
            this.updateViewContent,
            { view: this.view }
          );
          this.currentResponse = completion || "";
          console.log({
            currentMessageNumber,
            explainResponse: this.currentResponse,
          });
          break;
        case "Audit":
          if (model === DefaultOpenAiModel) {
            const p1 = FirstReplyForGpt3(
              prompt.languageId,
              prompt.selectedCode,
              prompt.auditContext || ""
            );
            const completion1: any = await this.openAiProvider.ask(
              model,
              p1,
              this.updateViewContent,
              { view: this.view }
            );
            const auditSearchPrompt2 = getAuditRequestMsg(
              prompt.languageId,
              completion1 || "",
              prompt.selectedCode
            );
            const completion2: any = await this.openAiProvider.ask(
              model,
              auditSearchPrompt2,
              this.updateViewContent,
              { view: this.view }
            );
            this.currentResponse = completion2;
          } else {
            const auditSearchPrompt = FirstAuditRequest(
              prompt.languageId,
              prompt.selectedCode,
              prompt.auditContext || ""
            );
            const completion1: any = await this.openAiProvider.ask(
              model,
              auditSearchPrompt,
              this.updateViewContent,
              { view: this.view }
            );
            this.currentResponse = completion1 || "";
          }

          break;

        default:
          break;
      }

      if (this.currentMessageNum !== currentMessageNumber) {
        return;
      }

      if (this.view) {
        this.view.show?.(true);
        this.view.webview.postMessage({
          type: "gptutor-set-answer",
          value: this.currentResponse,
        });
      }
    } catch (error: any) {
      vscode.window.showErrorMessage(error?.message || "ERROR");
    }
  }

  private getHtmlForWebview(webview: vscode.Webview) {
    const extensionUri = this.context.extensionUri;

    let src =
      vscode.ExtensionMode[this.context.extensionMode] == "Development"
        ? "src"
        : "out";
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(extensionUri, src, "media", "main.js")
    );
    const microlightUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        extensionUri,
        src,
        "media",
        "scripts",
        "microlight.min.js"
      )
    );
    const tailwindUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        extensionUri,
        src,
        "media",
        "scripts",
        "tailwind.min.js"
      )
    );
    const showdownUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        extensionUri,
        src,
        "media",
        "scripts",
        "showdown.min.js"
      )
    );

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<script src="${tailwindUri}"></script>
				<script src="${showdownUri}"></script>
				<script src="${microlightUri}"></script>
				<style>
				.code {
					white-space: pre;
				}
				p {
					padding-top: 0.4rem;
					padding-bottom: 0.4rem;
				}
				ul, ol {
					list-style: initial !important;
					margin-left: 10px !important;
				}
				h1, h2, h3, h4, h5, h6 {
					font-weight: bold !important;
				}
				#prompt-input {
					width: 100%;
					word-wrap: break-word;
          height: 30vh;
				}
				.hr {
					margin: 1rem auto;
					opacity: .3;
				}
				#response {
					padding-top: 0;
					font-size: 0.8rem;
					line-height: 1rem;
				}
				</style>
			</head>
			<body>
				<label>Question: </label>
				<textarea oninput="auto_grow(this)" class="h-30 w-full text-white bg-stone-700 p-2 text-sm" placeholder="Ask something" id="prompt-input">
				</textarea>
				<hr class="hr" />
				<label>Answer: </label>
				<div id="response" class="pt-4 text-sm">
				</div>

				<script src="${scriptUri}"></script>
			</body>
			</html>`;
  }
}

export function deactivate() {}
