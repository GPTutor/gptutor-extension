import { OpenAIApi } from 'openai';
import * as vscode from 'vscode';
import { GPTutorOpenAiProvider } from './openAi';
import { GPTutorPromptType, getExplainRequestMsg } from './prompt';

export class GPTutor implements vscode.WebviewViewProvider {
  public static readonly viewType = 'gptutor.chatView';

  private openAiProvider!: GPTutorOpenAiProvider;
  private view?: vscode.WebviewView;

  private context!: vscode.ExtensionContext;
  private currentResponse: string = '';
  private currentMessageNum = 0;
	private currentPrompt?: GPTutorPromptType;

  constructor(_context: vscode.ExtensionContext) {
    this.context = _context;
  }

  registerVscode() {
    this.context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(GPTutor.viewType, this,  {
        webviewOptions: { retainContextWhenHidden: true }
      })
    );
  }

  setOpenAiKey(key: string) {
    this.openAiProvider = new GPTutorOpenAiProvider();
    this.openAiProvider.setApiKey(key);
  }



  resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		this.view = webviewView;
		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [
				this.context.extensionUri
			]
		};
		webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);
		// webviewView.webview.onDidReceiveMessage(data => {
		// 	switch (data.type) {
		// 		case 'codeSelected':
		// 			{
		// 				// do nothing if the pasteOnClick option is disabled
		// 				if (!this._settings.pasteOnClick) {
		// 					break;
		// 				}
		// 				let code = data.value;
		// 				//code = code.replace(/([^\\])(\$)([^{0-9])/g, "$1\\$$$3");
		// 				const snippet = new vscode.SnippetString();
		// 				snippet.appendText(code);
		// 				// insert the code as a snippet into the active text editor
		// 				vscode.window.activeTextEditor?.insertSnippet(snippet);
		// 				break;
		// 			}
		// 		case 'prompt':
		// 			{
		// 				this.search(data.value);
		// 			}
		// 	}
		// });
		
	}


	public async search(prompt?: GPTutorPromptType) {
		this.currentPrompt = prompt;
		if (!prompt) {
			return;
		};

		// focus gpt activity from activity bar
		if (!this.view) {
			await vscode.commands.executeCommand(`${GPTutor.viewType}.focus`);
		} else {
			this.view?.show?.(true);
		}
		
		let response = '';
		this.currentResponse = '';
		const searchPrompt = getExplainRequestMsg(
			prompt.languageId,
			prompt.codeContext,
			prompt.question,
		);

    this.view?.webview.postMessage({ type: 'setPrompt', value: this.currentPrompt?.question || '' });
    this.view?.webview.postMessage({ type: 'addResponse', value: '...' });

    this.currentMessageNum++;

    try {
      let currentMessageNumber = this.currentMessageNum;

      const completion = await this.openAiProvider.ask(searchPrompt)
      this.currentResponse = completion.data.choices[0].message?.content || '';
			console.log({
				completion,
				currentMessageNumber,
				response: this.currentResponse,
			})
      if (this.currentMessageNum !== currentMessageNumber) {
        return;
      }

			if (this.view) {
				this.view.show?.(true);
				this.view.webview.postMessage({ type: 'addResponse', value: this.currentResponse });
			}

    } catch (error:any) {
      vscode.window.showErrorMessage(error?.message || 'ERROR');
    }
	}

	// private getHtmlForWebview(webview: vscode.Webview) {

	// 	return `<!DOCTYPE html>
	// 		<html lang="en">
	// 		<head>
	// 			<meta charset="UTF-8">
	// 			<meta name="viewport" content="width=device-width, initial-scale=1.0">

	// 		</head>
	// 		<body>
	// 			<h1>GPTutor</h1>
	// 		</body>
	// 		</html>`;
	// }

	private getHtmlForWebview(webview: vscode.Webview) {
    const extensionUri = this.context.extensionUri;

		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'src', 'media', 'main.js'));
		const microlightUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'src', 'media', 'scripts', 'microlight.min.js'));
		const tailwindUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'src', 'media', 'scripts', 'showdown.min.js'));
		const showdownUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'src', 'media', 'scripts', 'tailwind.min.js'));

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
				/* overrides vscodes style reset, displays as if inside web browser */
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
				}
				</style>
			</head>
			<body>
				<input class="h-10 w-full text-white bg-stone-700 p-2 text-sm" placeholder="Ask something" id="prompt-input" />
				
				<div id="response" class="pt-4 text-sm">
				</div>

				<script src="${scriptUri}"></script>
			</body>
			</html>`;
	}

}

export function deactivate() {}