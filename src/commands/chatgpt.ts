import { SlashCommandBuilder } from "discord.js";
import { Configuration, OpenAIApi } from "openai";
const configuration = new Configuration({
  organization: "org-UObui1CbtZH6VgPFzcceMB0K",
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const command = {
  data: new SlashCommandBuilder()
    .setName("chatgpt")
    .setDescription("Give any prompt and let AI respond.")
    .addStringOption(option =>
      option
        .setName("prompt")
        .setDescription("The user to ping")
        .setRequired(true)
    ),
  async execute(interaction: any) {
    // TODO:type fixing
    const prompt = interaction.options.getString("prompt");
    const openai = new OpenAIApi(configuration);

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      max_tokens: 450,
    });

    console.log("response from openai");
    console.log(response.data);
    await interaction.reply(
      `Prompt: ${prompt} \n\n Answer: ${response.data.choices[0].text}`
    );
    // await interaction.reply(response.data.choices[0].text);

    // await interaction.reply(response.data);
  },
};

export default command;
