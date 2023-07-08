import { window } from "vscode";
import * as vscode from "vscode";
import { Configuration, OpenAIApi } from "openai";
import { getReviewRequestMsg, reqType } from "./utils";
import { streaming_response } from "./streaming_answer";

export const DefaultOpenAiModel = "gpt-3.5-turbo";

export class GPTutorOpenAiProvider {
  openai!: OpenAIApi;

  constructor() {}

  setApiKey(apiKey: string) {
    this.openai = getOpenAI(apiKey);
  }

  async ask(
    model: string,
    requestMsg: reqType[],
    onUpdate: any = (
      new_text: string,
      total_text_so_far: string,
      options: object = {}
    ) => {
      console.log("onUpdate from openAI.ts");
    },
    options: object = {}
  ) {
    if (!this.openai) {
      // window.showErrorMessage('You need to set API key first.');
      throw new Error("You need to set API key first.");
    }
    // console.log(`Ask ${model}`);
    // requestMsg.forEach((msg, index) => {
    //   console.log(` requestMsg[${index}].length = ${msg.content.length}`);
    // });
    return await streaming_response(
      this.openai,
      requestMsg,
      model,
      onUpdate,
      options
    );

    // const request: any = {
    //   model: model,
    //   messages: requestMsg,
    // };
    // // // TODO: handle ERROR
    // return await this.openai.createChatCompletion(request);
    // const res = await this.openai.createChatCompletion(request);
    // return res.data.choices[0].message?.content || '';
  }
}

export async function openAiIsActive(apiKey: string | undefined) {
  if (apiKey === undefined) {
    return false;
  }
  const openai = getOpenAI(apiKey);
  // console.log(openai);
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

function getOpenAI(apiKey: string) {
  let configuration = new Configuration({
    apiKey: apiKey,
  });
  let basePath: any = vscode.workspace
    .getConfiguration("")
    .get("GPTutor.openaiBasePath");
  if (basePath) {
    configuration.basePath = basePath;
  }
  const openai = new OpenAIApi(configuration);
  return openai;
}
