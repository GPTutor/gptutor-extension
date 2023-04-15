import { OpenAIApi } from 'openai';
import * as vscode from 'vscode';
import { GPTutorOpenAiProvider } from './openAi';
import { GPTutorPromptType, getExplainRequestMsg, FirstAuditRequest, getAuditRequestMsg, CustomizePrompt } from './prompt';

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

	}

	public async search(prompt: GPTutorPromptType, type : string) {
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
		

    this.view?.webview.postMessage({ type: 'setPrompt', value: this.currentPrompt?.selectedcode });
    this.view?.webview.postMessage({ type: 'addResponse', value: '...' });

    this.currentMessageNum++;

    try {
      let currentMessageNumber = this.currentMessageNum;
	  switch (type) {
		case 'Explain':
			const ExplainsearchPrompt = getExplainRequestMsg(
				prompt.languageId,
				prompt.codeContext || '',
				prompt.selectedcode,
				);
			const explaincompletion = await this.openAiProvider.ask(ExplainsearchPrompt)
			let explainresponse = explaincompletion.data.choices[0].message?.content || '';
					console.log({
						currentMessageNumber,
						explainresponse,
				})
		  	break;
		case 'Audit':
			const AuditsearchPrompt = FirstAuditRequest(
				prompt.languageId,
				prompt.selectedcode,
				);
			const completion = await this.openAiProvider.ask(AuditsearchPrompt)
			let response = completion.data.choices[0].message?.content || '';
					console.log({
						currentMessageNumber,
						response,
				})

			const AuditfinalPrompt = getAuditRequestMsg(
					prompt.languageId,
					response,
					prompt.selectedcode,
					);
		  	break;
		  	
		default:
		  console.log('This is not a fruit.');
	  }
	  
      if (this.currentMessageNum !== currentMessageNumber) {
        return;
      }

    } catch (error:any) {
      vscode.window.showErrorMessage(error?.message || 'ERROR');
    }
		this.currentResponse = response;

		if (this.view) {
			this.view.show?.(true);
			this.view.webview.postMessage({ type: 'addResponse', value: response });
		}
	}

	private getHtmlForWebview(webview: vscode.Webview) {
    const extensionUri = this.context.extensionUri;

		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">

			</head>
			<body>
				<h1> GPTutor </h1>
			</body>
			</html>`;
	}

}

export function deactivate() {}