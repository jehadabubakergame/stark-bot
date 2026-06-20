const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const commands = [
    new SlashCommandBuilder()
        .setName('join')
        .setDescription('يدخل البوت إلى رومك الصوتي')
        .toJSON(),

    new SlashCommandBuilder()
        .setName('stats')
        .setDescription('يعرض إحصائيات السيرفر')
        .toJSON()
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('جاري تسجيل الأوامر...');

        await rest.put(
            Routes.applicationCommands('1517902347135877220'),
            { body: commands }
        );

        console.log('تم تسجيل /join بنجاح');
    } catch (error) {
        console.error(error);
    }
})();
