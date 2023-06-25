import axios from "axios";
async function askWithProxy(
  proxyUrl: string,
  credential: string,
  model: string,
  requestMsg: any,
  onUpdate: any = (
    new_text: string,
    total_text_so_far: string,
    options: object = {}
  ) => {
    console.log("onUpdate from openAI.ts");
  },
  options: any = {}
) {
  let finish = false;
  // Workaround to prevent "Error: certificate has expired"
  // https://stackoverflow.com/questions/69596523/ignoring-axios-error-for-invalid-certificates-when-creating-a-vscode-extension
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  let response = await axios.post(
    proxyUrl,
    {
      credential,
      model,
      messages: requestMsg,
      temperature: options.temperature || 0.9,
    },
    {
      responseType: "stream", // Set the response type to 'stream'
    }
  );
  console.log("AAAA", typeof response);

  // process.env.NODE_TLS_REJECT_UNAUTHORIZED = undefined;
  // console.log(response.data);
  let total_text_so_far = "";
  response.data.on("data", (chunk: any) => {
    // Process each chunk of data
    // console.log("chunk: ", chunk.toString());
    let chunk_str: string = chunk.toString();
    console.log("AAA");
    chunk_str.split("\n\n\n").forEach((line: string) => {
      total_text_so_far += line;
      console.log(line);
      onUpdate(line, total_text_so_far, options);
    });
  });
  response.data.on("end", () => {
    // Streaming response ended
    console.log("Streaming response ended");
    finish = true;
  });
  while (finish === false) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return;
}
export { askWithProxy };
